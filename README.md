# FinWise - Personal Finance Dashboard

FinWise is a modern, responsive personal finance management application built with React, TypeScript, and Supabase. It helps users track their accounts, expenses, and financial goals with a beautiful and intuitive interface.

![FinWise Dashboard](screenshot.png)

## Features

- 📊 Real-time financial dashboard
- 💳 Multiple account management
- 📅 Scheduled payments tracking
- 💰 Expense categorization
- 📈 Financial goals tracking
- 🌙 Dark mode support
- 📱 Responsive design
- 🔐 Secure authentication with Supabase

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase (Backend & Authentication)
- Zustand (State Management)
- React Router
- FontAwesome Icons

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/finwise.git
cd finwise
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Project Structure

```
src/
  ├── components/       # React components
  ├── contexts/        # React contexts
  ├── lib/            # Utility functions and configurations
  ├── pages/          # Page components
  ├── store/          # Zustand store definitions
  ├── styles/         # Global styles and Tailwind config
  ├── types/          # TypeScript type definitions
  └── utils/          # Helper functions
```

## Features in Detail

### Account Management
- Create and manage multiple accounts
- Track account balances
- Categorize accounts (personal, business, family)
- Set primary account

### Transaction Tracking
- Record expenses and income
- Categorize transactions
- Add notes and receipts
- View transaction history

### Scheduled Payments
- Set up recurring payments
- Get reminders for upcoming payments
- Track payment history

### Financial Goals
- Set savings goals
- Track progress
- Get insights and recommendations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Supabase](https://supabase.io/) for the amazing backend service
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [FontAwesome](https://fontawesome.com/) for the beautiful icons

---
*Note: This README will be automatically updated as new features are added to the project.*
