# Publishing Guide for @quantxdata/mcp-server

## Prerequisites

You need an npm account with publish access to the `@quantxdata` scope.

### Option 1: Publish from Local Machine (Recommended for Arpit)

1. **Clone the repo:**
   ```bash
   git clone https://github.com/appydam/quantxdata-mcp.git
   cd quantxdata-mcp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the package:**
   ```bash
   npm run build
   ```

4. **Login to npm:**
   ```bash
   npm login
   # Enter your npm username, password, and email
   ```

5. **Publish to npm:**
   ```bash
   npm publish --access public
   ```

6. **Verify publication:**
   ```bash
   npm view @quantxdata/mcp-server
   ```

### Option 2: Set Up Server Credentials (For Automated Publishing)

If you want Forge to publish directly from the server:

1. **Generate an npm access token:**
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token" → "Automation"
   - Copy the token (starts with `npm_`)

2. **Configure server credentials:**
   ```bash
   npm config set //registry.npmjs.org/:_authToken YOUR_NPM_TOKEN
   ```

3. **Test authentication:**
   ```bash
   npm whoami
   # Should return your npm username
   ```

4. **Forge can then publish:**
   ```bash
   cd /home/ubuntu/.openclaw/workspace/agents/forge/quantxdata-mcp
   npm publish --access public
   ```

## Post-Publish Verification

After publishing, verify the package is accessible:

```bash
# Install in a test directory
mkdir /tmp/test-mcp && cd /tmp/test-mcp
npm install @quantxdata/mcp-server

# Check the installed version
npm list @quantxdata/mcp-server
```

## Updating the Package

For future updates:

1. Update version in `package.json` (follow semver)
2. Rebuild: `npm run build`
3. Publish: `npm publish --access public`

## Troubleshooting

**Error: "You do not have permission to publish"**
- Verify you're logged in: `npm whoami`
- Check you have access to @quantxdata scope
- Add collaborator if needed: npm owner add USERNAME @quantxdata/mcp-server

**Error: "Version X.Y.Z already exists"**
- Increment version in package.json
- Rebuild and publish again

**Error: "Package name too similar to existing package"**
- Scoped packages (@quantxdata/...) bypass this check
- Ensure the exact name @quantxdata/mcp-server is used
