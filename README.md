# EZDL marketing site

Plain static HTML/CSS — no build step, no dependencies, no Node required.

```
EZDL-site/
├── index.html
├── css/
│   └── styles.css
└── js/            (empty — nothing needed yet)
```

## Deploy to Namecheap

Once your Namecheap hosting plan is active:

1. Log into **cPanel** (Namecheap emails you the login after you buy hosting, or find it under Hosting List → Manage → cPanel).
2. Open **File Manager** → go to `public_html` (this is the web root for your domain).
3. Upload `index.html` and the `css` folder into `public_html` (drag-and-drop works in File Manager, or use the Upload button; a zip can be uploaded then extracted in place).
4. Visit your domain — it should load immediately. No server config needed since this is 100% static.

Alternative: use an FTP client (FileZilla, or the "FTP Accounts" section in cPanel) and upload the same files to `public_html` over FTP instead of the browser File Manager — same result, useful once the site has more files.

## Updating later

Edit `index.html` / `css/styles.css` locally, then re-upload just the changed file(s) — no rebuild step.

## Known placeholders

- The "Download for Windows" button is intentionally disabled/inert (`coming soon`) until there's a real signed installer to link to. Swap it for a real `<a href="...">` once a release is published.
- No email capture yet — add one later via a form service (e.g. a simple mailto: link, or an embed from Mailchimp/Tally/Google Forms) once you decide how you want to collect signups.
