# Manual images

For images that can't be downloaded because the vendor link is already dead.

Save the image file into this folder using the exact `file` name listed in
`../manual-images.json`, then run:

    node scripts/localize-images.js            # confirms the file was found
    node scripts/localize-images.js --apply    # optimizes, saves, repoints the DB

The extension must match the manifest entry. If you save a `.png` but the
manifest says `.jpg`, rename the file or edit the manifest — the script reports
anything it's still waiting for rather than guessing.

To handle a future dead link, add another entry to the manifest:

    {
      "file": "some-product.jpg",
      "note": "why this is here",
      "targets": [
        { "model": "Player", "name": "Player Name", "field": "shoeImage" }
      ]
    }

Valid `field` values are `image`, `paddleImage`, `shoeImage`, `overgripImage`,
`weightImage`, and `additionalModificationImage`. Use `"model": "Paddle"` with
`"field": "image"` to set a paddle's own picture.
