import { 
  faShoppingCart,
  faUtensils,
  faHome,
  faCar,
  faPlane,
  faHeartbeat,
  faGraduationCap,
  faGamepad,
  faTshirt,
  faWifi,
  faDumbbell,
  faMoneyBillWave,
  faBriefcase,
  faGift,
  faHandHoldingDollar,
  faCoins,
  faEllipsisH
} from '@fortawesome/free-solid-svg-icons';

export const categories = {
  // Expense Categories
  groceries: {
    name: 'Groceries',
    icon: faShoppingCart,
    type: 'expense',
    color: '#4CAF50'
  },
  dining: {
    name: 'Dining Out',
    icon: faUtensils,
    type: 'expense',
    color: '#FF9800'
  },
  housing: {
    name: 'Housing',
    icon: faHome,
    type: 'expense',
    color: '#2196F3'
  },
  transportation: {
    name: 'Transportation',
    icon: faCar,
    type: 'expense',
    color: '#607D8B'
  },
  travel: {
    name: 'Travel',
    icon: faPlane,
    type: 'expense',
    color: '#9C27B0'
  },
  healthcare: {
    name: 'Healthcare',
    icon: faHeartbeat,
    type: 'expense',
    color: '#F44336'
  },
  education: {
    name: 'Education',
    icon: faGraduationCap,
    type: 'expense',
    color: '#795548'
  },
  entertainment: {
    name: 'Entertainment',
    icon: faGamepad,
    type: 'expense',
    color: '#E91E63'
  },
  clothing: {
    name: 'Clothing',
    icon: faTshirt,
    type: 'expense',
    color: '#9E9E9E'
  },
  utilities: {
    name: 'Utilities',
    icon: faWifi,
    type: 'expense',
    color: '#00BCD4'
  },
  fitness: {
    name: 'Fitness',
    icon: faDumbbell,
    type: 'expense',
    color: '#8BC34A'
  },

  // Income Categories
  salary: {
    name: 'Salary',
    icon: faBriefcase,
    type: 'income',
    color: '#4CAF50'
  },
  freelance: {
    name: 'Freelance',
    icon: faMoneyBillWave,
    type: 'income',
    color: '#2196F3'
  },
  gifts: {
    name: 'Gifts',
    icon: faGift,
    type: 'income',
    color: '#E91E63'
  },
  investments: {
    name: 'Investment Returns',
    icon: faCoins,
    type: 'income',
    color: '#9C27B0'
  },
  rental: {
    name: 'Rental Income',
    icon: faHome,
    type: 'income',
    color: '#FF9800'
  },
  other_income: {
    name: 'Other Income',
    icon: faHandHoldingDollar,
    type: 'income',
    color: '#607D8B'
  },

  // Other
  other: {
    name: 'Other',
    icon: faEllipsisH,
    type: 'expense',
    color: '#9E9E9E'
  }
} as const;

export type CategoryKey = keyof typeof categories; 