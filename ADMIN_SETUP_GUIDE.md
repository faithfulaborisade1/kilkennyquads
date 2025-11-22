# Admin Panel Setup Guide

## 🎯 Overview

This guide will help you set up the admin panel for the Kilkenny Mobility website so you can edit products and settings directly from your browser.

---

## ✅ Step 1: Update GitHub Repository Details

Before the admin panel can work, you need to update it with your GitHub repository information.

### 1.1 Find Your GitHub Username
1. Go to [github.com](https://github.com)
2. Click on your profile icon (top right)
3. Your username is shown there (e.g., "faithfulaborisade" or similar)

### 1.2 Find Your Repository Name
1. Go to your repositories page
2. Find the repository for "kilkenny mobility"
3. The repository name is shown at the top (it might have spaces or dashes)

### 1.3 Update admin.js
1. Open the file `admin.js` in a text editor
2. Find these lines at the top (around line 2-4):
   ```javascript
   const REPO_OWNER = 'faithfulaborisade'; // Update this with actual GitHub username
   const REPO_NAME = 'kilkenny mobility'; // Update this with actual repo name
   ```
3. Replace `'faithfulaborisade'` with your actual GitHub username
4. Replace `'kilkenny mobility'` with your actual repository name
5. Save the file

---

## ✅ Step 2: Create GitHub Personal Access Token

This token is like a special password that allows the admin panel to save changes to GitHub.

### 2.1 Go to GitHub Settings
1. Go to [github.com](https://github.com)
2. Click your profile icon (top right) → **Settings**
3. Scroll down to **Developer settings** (left sidebar, near bottom)
4. Click **Personal access tokens** → **Tokens (classic)**
5. Click **Generate new token** → **Generate new token (classic)**

### 2.2 Configure Token
1. **Note**: Enter "Kilkenny Mobility Admin Panel"
2. **Expiration**: Select "No expiration" (or your preference)
3. **Scopes**: Check these boxes:
   - ✅ **repo** (Full control of private repositories)
     - This will automatically check all sub-items
4. Scroll down and click **Generate token**

### 2.3 Save Your Token
⚠️ **IMPORTANT**: Copy the token immediately! It looks like: `ghp_xxxxxxxxxxxxxxxxxxxx`

You won't be able to see it again. Save it somewhere safe like:
- A password manager
- A secure note on your computer
- Write it down in a safe place

---

## ✅ Step 3: Upload Files to GitHub

You need to upload all the new files to your GitHub repository.

### Option A: Using GitHub Website (Easiest)

1. Go to your repository on GitHub
2. Click **Add file** → **Upload files**
3. Drag and drop these files:
   - `products.json`
   - `config.json`
   - `admin.html`
   - `admin.js`
   - `app.js`
4. The `index.html` file has been updated - you'll need to upload the new version
5. Scroll down, add commit message: "Add admin panel"
6. Click **Commit changes**

### Option B: Using Git Command Line

```bash
git add products.json config.json admin.html admin.js app.js index.html
git commit -m "Add admin panel with GitHub integration"
git push
```

---

## ✅ Step 4: Access the Admin Panel

### 4.1 First Login
1. Open your browser
2. Go to: `https://kilkennymobility.com/admin.html`
   (or `https://yourusername.github.io/kilkenny-mobility/admin.html` if not using custom domain)
3. You'll see a login screen
4. Paste your GitHub token (from Step 2.3)
5. Click **Login**

### 4.2 What You'll See
After logging in, you'll see:
- **Products Tab**: List of all products with Edit/Hide/Delete buttons
- **Site Settings Tab**: Contact information and business hours

---

## 🎨 How to Use the Admin Panel

### Editing a Product
1. Go to **Products** tab
2. Click **Edit** on any product
3. Update:
   - Product name
   - Price
   - Description
   - Colors
   - Features (add/remove with + and Remove buttons)
4. Click **Save Changes**
5. Wait for "Product updated successfully!" message
6. Changes appear on main site in ~30-60 seconds

### Hiding/Showing a Product
1. Click **Hide** button to remove from public view
2. Click **Show** button to make visible again
3. Hidden products won't appear on the main website

### Adding a New Product
1. Click **+ Add New Product** button
2. A template product opens in edit mode
3. Fill in all details
4. Click **Save Changes**
5. The new product appears on the site

**Note**: To add product images, you'll need to:
1. Upload images to the `images/` folder on GitHub first
2. Edit the product
3. Manually update image paths in `products.json` for now
   (Image upload feature can be added later)

### Deleting a Product
1. Click **Delete** button
2. Confirm the deletion
3. Product is permanently removed

### Updating Contact Information
1. Go to **Site Settings** tab
2. Update phone, email, address, or hours
3. Click **Save Settings**
4. Changes appear on main site in ~30-60 seconds

---

## 🔐 Security Tips

1. **Never share your GitHub token** - It gives full access to your repository
2. **Keep token safe** - Store it like a password
3. **Logout when done** - Click Logout button when finished editing
4. **Token stays saved** - Your browser remembers it, so you don't need to enter it every time
5. **Clear token** - To logout completely:
   - Click Logout button, OR
   - Open browser console (F12), type: `localStorage.clear()`

---

## 🐛 Troubleshooting

### "Invalid token" error
- Check you copied the entire token (starts with `ghp_`)
- Generate a new token and try again
- Make sure you selected the `repo` scope when creating token

### Changes not appearing on website
- Wait 1-2 minutes (GitHub Pages takes time to update)
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check if changes saved in GitHub repository

### Products not loading
- Check browser console for errors (F12 → Console tab)
- Verify `products.json` and `config.json` are uploaded
- Check file names are exactly correct (case-sensitive)

### Admin panel not opening
- Verify `admin.html` and `admin.js` are uploaded
- Check the URL is correct
- Try clearing browser cache

---

## 📝 Quick Reference

**Admin Panel URL**: `https://kilkennymobility.com/admin.html`

**Files Created**:
- `products.json` - Product database
- `config.json` - Site settings
- `admin.html` - Admin interface
- `admin.js` - Admin logic & GitHub API
- `app.js` - Main site dynamic loading
- `index.html` - Updated to load products dynamically

**What You Can Edit**:

**Products Tab:**
- ✅ Product names, prices, descriptions
- ✅ Product features and colors
- ✅ Show/hide products
- ✅ Add/delete products

**Site Settings Tab:**
- ✅ Business name & tagline
- ✅ Browser tab title
- ✅ Hero section (title, subtitle, button text)
- ✅ Products section (title & subtitle)
- ✅ Contact section (title & subtitle)
- ✅ Contact information (phone, email, address)
- ✅ Business hours (weekday & Saturday)
- ✅ Benefits list (add/remove/edit all benefits)
- ✅ Footer text (copyright & tagline)

**What Requires Manual Edit**:
- Product images (need to upload to GitHub first)
- CSS styling and colors
- Page layout and structure

---

## 🎉 You're All Set!

Once setup is complete, you can:
1. Visit `kilkennymobility.com/admin.html` anytime
2. Edit products and prices instantly
3. Changes go live automatically within minutes
4. No technical knowledge needed for daily updates

**Need Help?** Contact the developer who set this up for you.
