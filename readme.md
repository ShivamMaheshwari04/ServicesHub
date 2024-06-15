# ServiceHub

ServiceHub is a service management application. This README provides a comprehensive guide to set up the project.

## Prerequisites

- Node.js
- MySQL Workbench

## Technologies Used

### Frontend

- HTML
- CSS
- JavaScript
- Bootstrap

![HTML](path/to/html-logo.png)
![CSS](path/to/css-logo.png)
![JavaScript](path/to/js-logo.png)
![Bootstrap](path/to/bootstrap-logo.png)

### Backend

- Node.js
- Express.js
- SweetAlert (for showing alerts)

![Node.js](path/to/nodejs-logo.png)
![Express.js](path/to/express-logo.png)
![SweetAlert](path/to/sweetalert-logo.png)

### Database

- MySQL Workbench

![MySQL](path/to/mysql-logo.png)

## Setup Instructions

### 1. Install Node.js Modules

Make sure you have Node.js installed. Then, navigate to your project directory and install the required npm modules by running the following command:

```sh
npm install

```


### 2. Create the Database

Open MySQL Workbench and create a new database by running the following command:

```sh
CREATE DATABASE servicehub /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */;
```
### 3. Run All Queries to Create Tables

```sh
CREATE TABLE user (
  u_id varchar(25) NOT NULL,
  u_name varchar(50) NOT NULL,
  u_Email varchar(100) NOT NULL,
  u_address varchar(250) NOT NULL,
  PhoneNo bigint(10) NOT NULL,
  u_password varchar(45) NOT NULL,
  u_City varchar(40) NOT NULL,
  PRIMARY KEY (u_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE services (
  s_id varchar(25) NOT NULL,
  title varchar(80) NOT NULL,
  description varchar(500) NOT NULL,
  price int(11) NOT NULL,
  category varchar(45) NOT NULL,
  p_id varchar(25) NOT NULL,
  ImageLink varchar(255) NOT NULL,
  s_status varchar(20) NOT NULL,
  PRIMARY KEY (s_id),
  KEY p_id (p_id),
  CONSTRAINT p_id FOREIGN KEY (p_id) REFERENCES provider (p_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE provider (
  p_id varchar(25) NOT NULL,
  p_name varchar(50) NOT NULL,
  p_Email varchar(100) NOT NULL,
  p_address varchar(250) NOT NULL,
  contact_no bigint(10) NOT NULL,
  p_password varchar(45) NOT NULL,
  p_City varchar(40) NOT NULL,
  PRIMARY KEY (p_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE feedback (
  f_id varchar(10) NOT NULL,
  comment varchar(200) DEFAULT NULL,
  rating int(11) NOT NULL,
  b_id varchar(10) NOT NULL,
  f_status varchar(20) NOT NULL,
  PRIMARY KEY (f_id),
  UNIQUE KEY f_id_UNIQUE (f_id),
  KEY b_id_idx (b_id),
  CONSTRAINT b_id FOREIGN KEY (b_id) REFERENCES booking (b_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE booking (
  b_id varchar(10) NOT NULL,
  b_date date NOT NULL,
  timeslot varchar(50) NOT NULL,
  u_id varchar(25) NOT NULL,
  s_id varchar(25) NOT NULL,
  status varchar(20) NOT NULL,
  PRIMARY KEY (b_id),
  UNIQUE KEY b_id_UNIQUE (b_id),
  KEY u_id_idx (u_id),
  KEY s_id_idx (s_id),
  CONSTRAINT s_id FOREIGN KEY (s_id) REFERENCES services (s_id),
  CONSTRAINT u_id FOREIGN KEY (u_id) REFERENCES user (u_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

```

### 4. Configure Database Connection
Open the db.js file in your project and update the database connection details. Replace the placeholder password with your actual MySQL password:
```sh
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password', // replace 'your_password' with your actual MySQL password
  database: 'servicehub'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database!');
});

module.exports = connection;

```

### 5. Run the Application
Start the Node.js server by running the following command:

```sh
npm start
```


# Acknowledgments
Hat tip to anyone whose code was used
Inspiration
etc


### Additional Notes

- Ensure that all paths to images in the `README.md` file are correct. Upload your images to the GitHub repository or a suitable online location.
- Replace `your_password` in the `db.js` file snippet with your actual MySQL password.
- Update the list of dependencies in the `package.json` example according to your project's requirements.

<hr>

# Screenshots

![Screenshot 2](https://i.postimg.cc/tTKsqYbS/Screenshot-2024-04-07-204922.png)
![Screenshot 1](https://i.postimg.cc/5ttYphp3/Screenshot-165.png)
![Screenshot 3](https://i.postimg.cc/3x10X8jN/Screenshot-2024-04-07-205016.png)
![Screenshot 4](https://i.postimg.cc/FsjLKg7j/Screenshot-2024-04-07-205026.png)
![Screenshot 5](https://i.postimg.cc/T3fW5LDB/Screenshot-2024-04-07-212014.png)
![Screenshot 6](https://i.postimg.cc/cJDYSx62/Screenshot-2024-04-07-212133.png)

