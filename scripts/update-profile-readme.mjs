import { readFile, writeFile } from "node:fs/promises";

const username = process.env.GITHUB_USERNAME || "sakshianil";
const readmePath = process.env.README_PATH || "README.md";
const token = process.env.GITHUB_TOKEN || "";
const apiBase = "https://api.github.com";

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "profile-readme-updater",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function fetchJson(url) {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API request failed (${response.status}) for ${url}`);
  }

  return response.json();
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(new Date(value));
}

function truncate(text, maxLength) {
  if (!text) return "No description yet.";
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

function languageSummary(repos) {
  const counts = new Map();

  for (const repo of repos) {
    if (!repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6);
}

function buildProgressBar(value, total) {
  const width = 20;
  const filled = total === 0 ? 0 : Math.round((value / total) * width);
  return `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
}

function buildLanguageBlock(repos) {
  const languages = languageSummary(repos);
  const total = languages.reduce((sum, [, count]) => sum + count, 0);

  if (languages.length === 0) {
    return "No primary languages reported by public repositories yet.";
  }

  return [
    "```text",
    ...languages.map(([language, count]) => {
      const pct = total === 0 ? 0 : (count / total) * 100;
      return `${language.padEnd(18)} ${String(count).padStart(2)} repos   ${buildProgressBar(count, total)}   ${pct.toFixed(1).padStart(5)} %`;
    }),
    "```",
  ].join("\n");
}

function buildRepoList(repos) {
  const visibleRepos = repos
    .filter((repo) => !repo.archived)
    .slice(0, 6);

  if (visibleRepos.length === 0) {
    return "- Public project list will appear here after repositories are available.";
  }

  return visibleRepos
    .map((repo) => {
      const label = repo.fork ? "fork" : "source";
      const language = repo.language ? ` · ${repo.language}` : "";
      return `- [${repo.name}](${repo.html_url}) (${label}${language}) - ${truncate(repo.description, 120)}`;
    })
    .join("\n");
}

async function main() {
  const [profile, repos] = await Promise.all([
    fetchJson(`${apiBase}/users/${username}`),
    fetchJson(`${apiBase}/users/${username}/repos?per_page=100&sort=updated`),
  ]);

  const sourceRepos = repos.filter((repo) => !repo.fork);
  const latestPush = repos
    .map((repo) => repo.pushed_at)
    .filter(Boolean)
    .sort()
    .at(-1);

  const generatedAt = new Date();
  const generated = `## GitHub Snapshot

![Public Repos](https://img.shields.io/badge/Public%20Repos-${profile.public_repos}-blue?style=flat)
![Followers](https://img.shields.io/badge/Followers-${profile.followers}-blue?style=flat)
![Location](https://img.shields.io/badge/Location-${encodeURIComponent(profile.location || "Global")}-7B68EE?style=flat)

**My GitHub Data**

> Public repositories: **${profile.public_repos}**
>
> Source repositories: **${sourceRepos.length}**
>
> Forked repositories: **${repos.length - sourceRepos.length}**
>
> Latest public push: **${latestPush ? formatDate(latestPush) : "Not available"}**

**I Mostly Code In**

${buildLanguageBlock(repos)}

**Recently Updated Projects**

${buildRepoList(repos)}

Last updated: ${formatDate(generatedAt.toISOString())} Europe/Berlin`;

  const readme = await readFile(readmePath, "utf8");
  const updated = readme.replace(
    /<!--START_SECTION:github_activity-->[\s\S]*?<!--END_SECTION:github_activity-->/,
    `<!--START_SECTION:github_activity-->\n${generated}\n<!--END_SECTION:github_activity-->`,
  );

  if (updated === readme) {
    throw new Error("Could not find github_activity markers in README.md");
  }

  await writeFile(readmePath, updated);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
