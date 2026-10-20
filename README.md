# SplitX — Smart Expense Sharing

SplitX is a full-stack expense-sharing application that helps groups manage shared expenses, track balances, and settle debts.

## Features

- User registration and login
- Create and manage expense groups
- Add members to groups
- Record shared expenses
- Track expense shares and group balances
- Manage settlements between members
- Responsive React user interface

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS

**Backend**
- Java
- Spring Boot
- Spring Data JPA
- Hibernate
- Maven

**Database**
- MySQL

**API Documentation**
- Swagger / OpenAPI

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/jaygohil1/SplitX.git
cd SplitX
```

### 2. Configure MySQL

Create the database:

```sql
CREATE DATABASE splitxdb;
```

Configure your database connection in `src/main/resources/application.properties`. Use your own local credentials and avoid committing passwords or secrets.

### 3. Start the backend

```bash
.\mvnw.cmd spring-boot:run
```

Backend: `http://localhost:8080`

Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### 4. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite.

## Project Structure

```text
SplitX/
├── frontend/     # React frontend
├── src/          # Spring Boot backend
├── pom.xml       # Maven configuration
└── README.md
```

## Security

Configure database credentials through environment variables or another secure local configuration. Never commit real credentials, API keys, or sensitive user data.

## License

No license has been specified yet.
