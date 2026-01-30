HEAD

# BiblioFlow - Library Management System

A modern, enterprise-grade Library Management System built with React, Node.js, and MySQL.

## Features
- **Dynamic Hierarchy Control**: Manage Library -> Section -> Shelf -> Category -> Book Format with strict rule validation.
- **Modern Dashboard**: KPI cards, real-time charts, and recent activity monitoring.
- **Premium UI**: Glassmorphism, smooth animations, and tailored color palettes.
- **Secure**: JWT-based authentication and role-based access control.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Recharts, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, JWT, MySQL.

## Setup Instructions

### 1. Database Setup
1. Open your MySQL client (e.g., MySQL Workbench, XAMPP, or Terminal).
2. Execute the SQL commands found in `server/schema.sql`.
   - This will create the `library_system` database and necessary tables.
   - It also seeds a default admin user.

### 2. Environment Configuration
Check `server/.env` and update the database credentials if necessary:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=library_system
JWT_SECRET=supersecretkeylibrary
```

### 3. Install Dependencies
Run the following in the root directory:
```bash
# In server directory
cd server && npm install

# In client directory
cd client && npm install
```

### 4. Start the Application
You can use the provided PowerShell script:
```powershell
./start-app.ps1
```
Or run them manually in two separate terminals:
**Terminal 1 (Backend):**
```bash
cd server && npm run dev
```
**Terminal 2 (Frontend):**
```bash
cd client && npm run dev
```

## Login Credentials
- **Username**: `admin`
- **Password**: `password123`

**Edit a file, create a new file, and clone from Bitbucket in under 2 minutes**

When you're done, you can delete the content in this README and update the file with details for others getting started with your repository.

*We recommend that you open this README in another tab as you perform the tasks below. You can [watch our video](https://youtu.be/0ocf7u76WSo) for a full demo of all the steps in this tutorial. Open the video in a new tab to avoid leaving Bitbucket.*

---

## Edit a file

You’ll start by editing this README file to learn how to edit a file in Bitbucket.

1. Click **Source** on the left side.
2. Click the README.md link from the list of files.
3. Click the **Edit** button.
4. Delete the following text: *Delete this line to make a change to the README from Bitbucket.*
5. After making your change, click **Commit** and then **Commit** again in the dialog. The commit page will open and you’ll see the change you just made.
6. Go back to the **Source** page.

---

## Create a file

Next, you’ll add a new file to this repository.

1. Click the **New file** button at the top of the **Source** page.
2. Give the file a filename of **contributors.txt**.
3. Enter your name in the empty file space.
4. Click **Commit** and then **Commit** again in the dialog.
5. Go back to the **Source** page.

Before you move on, go ahead and explore the repository. You've already seen the **Source** page, but check out the **Commits**, **Branches**, and **Settings** pages.

---

## Clone a repository

Use these steps to clone from SourceTree, our client for using the repository command-line free. Cloning allows you to work on your files locally. If you don't yet have SourceTree, [download and install first](https://www.sourcetreeapp.com/). If you prefer to clone from the command line, see [Clone a repository](https://confluence.atlassian.com/x/4whODQ).

1. You’ll see the clone button under the **Source** heading. Click that button.
2. Now click **Check out in SourceTree**. You may need to create a SourceTree account or log in.
3. When you see the **Clone New** dialog in SourceTree, update the destination path and name if you’d like to and then click **Clone**.
4. Open the directory you just created to see your repository’s files.

Now that you're more familiar with your Bitbucket repository, go ahead and add a new file locally. You can [push your change back to Bitbucket with SourceTree](https://confluence.atlassian.com/x/iqyBMg), or you can [add, commit,](https://confluence.atlassian.com/x/8QhODQ) and [push from the command line](https://confluence.atlassian.com/x/NQ0zDQ).
4826a74b7c4c0054282897f8db9fc9848fc8bebe
