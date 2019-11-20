# Changes to apimd

### 0.3.2 (November 20, 2019)

- Fixed: Issue where request headers were case sensitive when they should not be

### 0.3.1 (November 20, 2019)

- Fixed: Issue where endpoints would not match URL in middleware
- Fixed: Issue where endpoint clones would keep too much of their predecessor

### 0.3.0 (November 15, 2019)

- Added: Ability to define response status and content type from a header
- Changed: `live` is default for **rescript** and **rewired** versions
- Changed: **rewired** version is now set to the `devServer` property

### 0.2.1 (November 15, 2019)

- Fixed: missing `util.js` in publish

### 0.2.0 (November 15, 2019)

- Added: rescripts version
- Added: support for `apimd` field in `package.json` for **rescript** and **rewired** versions

### 0.1.0 (November 15, 2019)

- Added: initial version
