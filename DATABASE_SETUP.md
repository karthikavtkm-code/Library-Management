# Database Setup Instructions

## Issue
The MySQL root user requires a password, but the `.env` file has an empty password.

## Solution Options

### Option 1: Find Your MySQL Root Password (Recommended)
1. Check if you set a password during MySQL installation
2. Update the `.env` file with your MySQL root password:
   ```
   DB_PASSWORD=your_mysql_password_here
   ```
3. Run the setup script:
   ```powershell
   node setup-db.js
   ```

### Option 2: Reset MySQL Root Password
If you don't remember your MySQL password, you can reset it:

1. Stop MySQL service:
   ```powershell
   Stop-Service MySQL80
   ```

2. Start MySQL in safe mode (skip grant tables)
3. Reset the password
4. Restart MySQL normally

**OR use MySQL Workbench to connect and reset the password.**

### Option 3: Create a New MySQL User (Easiest)
1. Open MySQL Workbench or command line with your current credentials
2. Run these commands:
   ```sql
   CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'library_password';
   GRANT ALL PRIVILEGES ON library_system.* TO 'library_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. Update `.env` file:
   ```
   DB_USER=library_user
   DB_PASSWORD=library_password
   ```

4. Run the setup script:
   ```powershell
   node setup-db.js
   ```

### Option 4: Manual Setup via MySQL Workbench (Quickest)
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open the file `setup-tables.sql` in MySQL Workbench
4. Execute the script (click the lightning bolt icon)
5. Verify tables are created

## After Database Setup
Once the database is set up, restart your server:
```powershell
npm start
```

The server should now connect successfully and the "Add Book" feature will work!
