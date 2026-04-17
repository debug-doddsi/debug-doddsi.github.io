# How to deploy ionakate.uk via GitHub Pages

These instructions assume you have Git, Node, and pnpm installed locally,
and that you have a GitHub account.

---

## 1. Create a GitHub repository

1. Go to https://github.com/new
2. Name it exactly: `ionakate.uk`
   (GitHub Pages serves a repo named <yourusername>.github.io from a special
   URL, but since you have a custom domain, the repo name doesn't have to match)
   A clean name like `portfolio` or `ionakate-site` is fine too.
3. Set it to **Public** (required for free GitHub Pages).
4. Do NOT initialise with a README — you'll push your own files.

---

## 2. Push the project to GitHub

Open a terminal in the root of this project folder, then run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual values.

---

## 3. Enable GitHub Pages with GitHub Actions

1. On GitHub, open your repository.
2. Go to **Settings → Pages**.
3. Under **Source**, select **GitHub Actions** (not "Deploy from a branch").
4. Save.

The workflow file at `.github/workflows/deploy.yml` will now run automatically
every time you push to `main`. It installs dependencies, builds the site, and
deploys the `dist/` folder.

---

## 4. Point your custom domain at GitHub Pages

### In GitHub:
1. Go to **Settings → Pages → Custom domain**.
2. Enter `ionakate.uk` and click Save.
3. GitHub will verify the domain (this can take a few minutes).
4. Tick **Enforce HTTPS** once it appears.

The `public/CNAME` file in this project already contains `ionakate.uk`, which
means every build will preserve that setting automatically.

### In GoDaddy (DNS records):
Log in to GoDaddy → your domain → DNS Management.
Add or update these records:

| Type  | Name | Value                 | TTL  |
|-------|------|-----------------------|------|
| A     | @    | 185.199.108.153       | 600  |
| A     | @    | 185.199.109.153       | 600  |
| A     | @    | 185.199.110.153       | 600  |
| A     | @    | 185.199.111.153       | 600  |
| CNAME | www  | YOUR_USERNAME.github.io | 600 |

These are GitHub's Pages IP addresses. DNS changes can take up to 48 hours
to propagate, though it's usually much faster.

---

## 5. Verify everything works

1. Push a commit to `main`.
2. Go to your repo → **Actions** tab — you should see the workflow running.
3. Once it shows a green tick, visit https://ionakate.uk

---

## Day-to-day workflow after setup

Any time you want to update the site:

```bash
# make your changes, then:
git add .
git commit -m "describe what you changed"
git push
```

The GitHub Action handles the rest automatically. No manual build step needed.

---

## Local development

```bash
pnpm install   # first time only
pnpm dev       # starts at http://localhost:5173
```
