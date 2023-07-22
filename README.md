# [Netwrk](https://netwrk.paulgeorge.dev)

Netwrk is a web application (created using [T3 Stack](https://create.t3.gg/)) designed to help you manage and keep track of your real-world connections. You can create, edit, and search contacts and interactions on your account. You can also set reminders for specific dates related to a contact and create groups to aggregate contacts.

- [Next.js](https://nextjs.org)
- [tRPC](https://trpc.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [PlanetScale](https://planetscale.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth](https://next-auth.js.org/)
- [Shadcn/UI](https://ui.shadcn.com/) Special thanks to **shadcn**!

## Features

Current features include creating, editing, and searching contacts and interactions, setting reminders for specific dates related to a contact, and creating groups to aggregate contacts.

## To follow

- [ ] Reminders for specific dates and contacts
- [ ] AI-powered text interpreter and summary.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v14 or later)
- pnpm package manager

### Installation

Clone the repository:
`git clone https://github.com/paulgeorge35/netwrk.git`

### Install the dependencies:

```
cd netwrk
pnpm install
```

### Set up an OAuth app in the GitHub developer section.

### Create a .env file in the root directory of the project and add your environment variables:

```
DATABASE_URL="your_database_url"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="your_nextauth_url"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

### Run Prisma commands:

```
pnpm prisma db push
pnpm prisma db seed
```

### Run the development server:

```
pnpm run dev
```

### Now, the application should be running at http://localhost:3000.

### Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### License

This project is licensed under the MIT License - see the LICENSE.md file for details.

### Contact

Paul George - contact@paulgeorge.dev

Project Link: https://github.com/paulgeorge35/netwrk
