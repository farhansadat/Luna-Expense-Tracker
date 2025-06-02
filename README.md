# Luna - Personal Finance Dashboard

Luna is a modern, responsive personal finance management application built with React, TypeScript, and Supabase. It helps users track their accounts, expenses, and financial goals with a beautiful and intuitive interface, powered by an AI assistant.

Created by Said Alimullah Sadat

![Luna Dashboard](screenshots/dashboard.png)

## Features

- 🤖 AI-powered financial insights and recommendations
- 📊 Real-time financial dashboard
- 💳 Multiple account management
- 📅 Scheduled payments tracking
- 💰 Expense categorization and analytics
- 📈 Financial goals tracking
- 🌙 Dark mode support
- 📱 Responsive design
- 🔐 Secure authentication with Supabase
- 📸 Receipt scanning and OCR support
- 📊 Investment portfolio tracking
- 💡 Smart budget recommendations

## Tech Stack

- React 18
- TypeScript 5
- Tailwind CSS
- Framer Motion
- Supabase (Backend & Authentication)
- Zustand (State Management)
- React Router v6
- FontAwesome Icons
- OpenAI Integration

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm 9.0 or later
- A Supabase account
- An OpenAI API key (optional, for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/farhansadat/Luna-Expense-Tracker.git
cd Luna-Expense-Tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key  # Optional, for AI features
```

4. Set up the database:
- Create a new Supabase project
- Run the migration scripts from the `supabase/migrations` folder in order
- The migrations will set up all necessary tables and functions

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Project Structure

```
src/
  ├── components/     # React components
  │   ├── onboarding/  # Onboarding flow components
  │   └── ...         # Other component categories
  ├── contexts/      # React contexts
  ├── layouts/       # Layout components
  ├── lib/          # Utility functions and configurations
  ├── pages/        # Page components
  ├── store/        # Zustand store definitions
  ├── data/         # Static data and configurations
  ├── types/        # TypeScript type definitions
  └── utils/        # Helper functions
```

## Features in Detail

### AI-Powered Insights
- Get personalized financial advice
- Automatic expense categorization
- Smart budget recommendations
- Spending pattern analysis

### Account Management
- Create and manage multiple accounts
- Track account balances in real-time
- Categorize accounts (personal, business, family)
- Set primary account
- Transfer between accounts

### Transaction Tracking
- Record expenses and income
- Scan receipts with OCR
- Categorize transactions automatically
- Add notes and attachments
- View detailed transaction history
- Export transactions

### Scheduled Payments
- Set up recurring payments
- Get reminders for upcoming payments
- Track payment history
- Automatic payment categorization

### Financial Goals
- Set multiple savings goals
- Track progress with visual indicators
- Get AI-powered recommendations
- Adjust goals based on performance

### Investment Tracking
- Monitor investment portfolio
- Track returns and performance
- View asset allocation
- Set investment goals

## Screenshots

Screenshots of the application can be found in the [screenshots](./screenshots) directory. Here are some highlights:

- Dashboard Overview
- Account Management
- Expense Tracking
- Goals Dashboard
- Investment Portfolio
- AI Insights

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Database Migrations
```bash
cd supabase
supabase migration up
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Author

**Said Alimullah Sadat**
- GitHub: [@farhansadat](https://github.com/farhansadat)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Supabase](https://supabase.io/) for the amazing backend service
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [FontAwesome](https://fontawesome.com/) for the beautiful icons
- [OpenAI](https://openai.com/) for powering our AI features

---
*Built with ❤️ by Said Alimullah Sadat using React, TypeScript, and Supabase*
