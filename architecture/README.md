# Discovery Platform Architecture

You can view the current version/status here: https://nypl-discovery.github.io/discovery-general/architecture/

**To update status:**

1. Edit [components.json](https://github.com/NYPL-discovery/discovery-general/blob/master/architecture/components.json) - you can do this directly in github UI or clone and edit it locally.
2. Possible statuses: `planned`, `in-progress`, `code-complete`, `in-production`

**To change the diagram (currently a crappy process):**

1. Open the latest [graffle](https://github.com/NYPL-discovery/discovery-general/tree/master/architecture/graffle) file
2. Make a copy and rename to current date
3. Make your edits and save
4. If you add a new component, go to it's properties -> Action -> Opens a URL, and enter a unique identifier (e.g. `sierra_bib_retriever`. This will be the key that will be added to the `components.json` later.
5. Export as an svg to `./architecture/svg` directory
6. Run the svg fixer script to correct some references (see `fix-svgs.sh` for details):
```
./fix-svgs.sh
```
7. Edit [components.json](https://github.com/NYPL-discovery/discovery-general/blob/master/architecture/components.json) as needed. You can add a new key for a new component using the identifier from step 4.
8. Update the `DIAGRAM` variable in [js/diagram.js](https://github.com/NYPL-discovery/discovery-general/blob/master/architecture/js/diagram.js) with the new svg.
9. Push your changes to master
