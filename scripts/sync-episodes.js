#!/usr/bin/env node

const https = require("https")
const fs = require("fs")
const path = require("path")
const { parseString } = require("xml2js")

// Anchor RSS URL is still active (maintained by Spotify after rebrand)
const RSS_URL = "https://anchor.fm/s/3aa6289c/podcast/rss"
const SPOTIFY_SHOW_ID = "4EJKFhKayQp6Bv6ERxvbmz"
const EPISODES_DIR = path.join(__dirname, "..", "src", "episodes")

const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

// ── HTTP helpers ─────────────────────────────────────────────────────

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { "User-Agent": "Mozilla/5.0", ...headers },
    }

    const handler = (res) => {
      if (
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        const next = res.headers.location.startsWith("http")
          ? res.headers.location
          : new URL(res.headers.location, url).href
        return fetchUrl(next, headers).then(resolve).catch(reject)
      }
      let data = ""
      res.on("data", (chunk) => (data += chunk))
      res.on("end", () => resolve(data))
      res.on("error", reject)
    }
    https.get(options, handler).on("error", reject)
  })
}

// ── String helpers ───────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function formatDatePT(date) {
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = MONTHS_PT[date.getUTCMonth()]
  const year = date.getUTCFullYear()
  return `${day} de ${month} de ${year}`
}

function isoDate(date) {
  return date.toISOString().split("T")[0]
}

function extractEpisodeNumber(title) {
  const match = title.match(/EP\s*(\d+)/i)
  return match ? parseInt(match[1], 10) : null
}

function cleanTitle(title) {
  return title
    .replace(/^EP\s*\d+\s*[-:.]?\s*/i, "")
    .replace(/\s*-\s*$/, "") // strip trailing dash
    .trim()
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

const BOILERPLATE_MARKERS = [
  "Espero que goste deste episódio",
  "Espero que gostem",
  "Curta, comente, divulgue",
  "Nos siga no instagram",
  "#Estamos entre os",
  "# 1º Podcast",
  "Este Podcast tem o apoio",
  "Episódio gravado no estúdio",
  "Espisódio gravado no estúdio",
  "podcast_arquiteturaemtudo@",
  "Whatsapp:",
  "Patrocínio:",
]

function removeBoilerplate(text) {
  let clean = text
  for (const marker of BOILERPLATE_MARKERS) {
    const idx = clean.indexOf(marker)
    if (idx > 0) {
      clean = clean.substring(0, idx).trim()
    }
  }
  return clean
}

function extractDescription(rawHtml) {
  const text = removeBoilerplate(stripHtml(rawHtml))

  const paragraphs = text.split("\n\n").filter((p) => p.trim().length > 0)
  let desc = ""
  for (const p of paragraphs) {
    if ((desc + p).length > 500) break
    desc += (desc ? "\n\n" : "") + p.trim()
  }
  return desc || paragraphs[0] || ""
}

function escapeYaml(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

// ── Existing episodes detection ──────────────────────────────────────

function getExistingEpisodes() {
  const dirs = fs.readdirSync(EPISODES_DIR)
  const existing = new Map()

  for (const dir of dirs) {
    const mdPath = path.join(EPISODES_DIR, dir, "index.md")
    if (!fs.existsSync(mdPath)) continue

    const content = fs.readFileSync(mdPath, "utf-8")
    const match = content.match(/episode:\s*"EP\s*(\d+)"/)
    if (match) {
      existing.set(parseInt(match[1], 10), dir)
    }
  }
  return existing
}

// ── Spotify ID resolution ────────────────────────────────────────────

async function fetchSpotifyEpisodeMap() {
  console.log("Fetching Spotify episode IDs...")

  try {
    // Step 1: Get anonymous access token from Spotify embed page
    const embedUrl = `https://open.spotify.com/embed/show/${SPOTIFY_SHOW_ID}`
    const embedHtml = await fetchUrl(embedUrl)

    const tokenMatch = embedHtml.match(/"accessToken":"([^"]+)"/)
    if (!tokenMatch) {
      console.log("  Could not obtain Spotify access token")
      return new Map()
    }
    const token = tokenMatch[1]

    // Step 2: Fetch all episodes from Spotify API (paginated)
    const episodeMap = new Map() // epNum -> spotifyId
    let offset = 0
    const limit = 50

    while (true) {
      const apiUrl =
        `https://api.spotify.com/v1/shows/${SPOTIFY_SHOW_ID}/episodes` +
        `?limit=${limit}&offset=${offset}&market=BR`

      const response = await fetchUrl(apiUrl, {
        Authorization: `Bearer ${token}`,
      })
      const data = JSON.parse(response)

      if (!data.items || data.items.length === 0) break

      for (const ep of data.items) {
        const epNum = extractEpisodeNumber(ep.name)
        if (epNum) {
          episodeMap.set(epNum, ep.id)
        }
      }

      if (!data.next) break
      offset += limit
    }

    console.log(`  Found ${episodeMap.size} Spotify episode IDs`)
    return episodeMap
  } catch (err) {
    console.log(`  Spotify lookup failed: ${err.message}`)
    return new Map()
  }
}

// ── Markdown generation ──────────────────────────────────────────────

function generateMarkdown(episode) {
  const descForFrontmatter = escapeYaml(episode.description)

  const frontmatter = [
    "---",
    `title: "${escapeYaml(episode.title)}"`,
    `formattedDate: "${episode.formattedDate}"`,
    `date: "${episode.date}"`,
    `path: "${episode.path}"`,
    `description: "${descForFrontmatter}"`,
    `episode: "EP ${episode.epNum}"`,
    `length: "${episode.duration}"`,
    `id: "${episode.spotifyId}"`,
    "---",
  ].join("\n")

  const body = `
# Descrição

${episode.fullDescription}

---

Para conhecer o escritório de arquitetura, acesse: [analore.com.br](https://www.analore.com.br/)

Instagram: [@analorearquitetura](https://www.instagram.com/analorearquitetura)
`

  return frontmatter + "\n" + body
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  const dryRun = process.argv.includes("--dry-run")

  // Fetch Spotify episode IDs and RSS feed in parallel
  const [spotifyMap, xml] = await Promise.all([
    fetchSpotifyEpisodeMap(),
    fetchUrl(RSS_URL).then((xml) => {
      console.log("Fetching RSS feed...")
      return xml
    }),
  ])

  const result = await new Promise((resolve, reject) => {
    parseString(xml, (err, res) => (err ? reject(err) : resolve(res)))
  })

  const items = result.rss.channel[0].item || []
  const existingEps = getExistingEpisodes()

  console.log(`Found ${items.length} episodes in RSS feed`)
  console.log(
    `Existing episodes on site: ${[...existingEps.keys()].sort((a, b) => a - b).join(", ")}`
  )
  console.log("")

  const missingIds = []
  let created = 0

  for (const item of items) {
    const rawTitle = (item.title[0] || "").trim()
    const epNum = extractEpisodeNumber(rawTitle)

    if (!epNum) {
      console.log(`  Skipping "${rawTitle}" — no episode number found`)
      continue
    }

    if (existingEps.has(epNum)) {
      continue
    }

    const pubDate = new Date(item.pubDate[0])
    const dateStr = isoDate(pubDate)
    const formattedDate = formatDatePT(pubDate)

    const cleanedTitle = cleanTitle(rawTitle)
    const slug = slugify(cleanedTitle)
    const dirName = `${dateStr}-${slug}`
    const episodePath = `/${slug}`

    const rawDesc = item.description ? item.description[0] : ""
    const description = extractDescription(rawDesc)
    const fullDescription = removeBoilerplate(stripHtml(rawDesc))

    const duration = item["itunes:duration"]
      ? item["itunes:duration"][0]
      : "00:00:00"

    const spotifyId = spotifyMap.get(epNum) || ""

    if (!spotifyId) {
      missingIds.push({ epNum, title: cleanedTitle })
    }

    const episode = {
      title: cleanedTitle,
      formattedDate,
      date: dateStr,
      path: episodePath,
      description,
      fullDescription,
      epNum,
      duration,
      spotifyId,
    }

    const markdown = generateMarkdown(episode)
    const episodeDir = path.join(EPISODES_DIR, dirName)

    if (dryRun) {
      console.log(`  [DRY RUN] Would create: ${dirName}/index.md`)
      console.log(
        `    Title: "${cleanedTitle}" | Duration: ${duration} | Spotify: ${spotifyId || "MISSING"}`
      )
    } else {
      fs.mkdirSync(episodeDir, { recursive: true })
      fs.writeFileSync(path.join(episodeDir, "index.md"), markdown, "utf-8")
      console.log(`  Created: ${dirName}/`)
    }

    created++
  }

  console.log("")
  console.log(
    dryRun
      ? `Done! ${created} episode(s) would be created.`
      : `Done! Created ${created} new episode(s).`
  )

  if (missingIds.length > 0) {
    console.log("")
    console.log("Episodes missing Spotify IDs (update manually):")
    console.log(
      `  Find IDs at: https://open.spotify.com/show/${SPOTIFY_SHOW_ID}`
    )
    console.log(
      "  The ID is the last part of the episode URL: open.spotify.com/episode/<ID>"
    )
    console.log("")
    for (const ep of missingIds) {
      console.log(`  EP ${ep.epNum}: ${ep.title}`)
    }
  }
}

main().catch((err) => {
  console.error("Error:", err.message)
  process.exit(1)
})
