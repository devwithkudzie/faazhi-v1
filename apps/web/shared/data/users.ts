import type { User } from "@/shared/types";

export const users: User[] = [
  {
    id: "u-admin",
    email: "admin@faazhi.local",
    password: "Admin123!",
    name: "Dr. Aisha Rahman",
    role: "admin",
    avatarColor: "hsl(218 65% 22%)",
  },
  {
    id: "u-student-1",
    email: "student1@faazhi.local",
    password: "Student123!",
    name: "Priya Shah",
    role: "student",
    avatarColor: "hsl(38 75% 52%)",
    centreNumber: "GB123",
    candidateNumber: "0042",
    enrolledSubjects: ["9618"],
  },
  {
    id: "u-student-2",
    email: "student2@faazhi.local",
    password: "Student123!",
    name: "Liam Carter",
    role: "student",
    avatarColor: "hsl(358 60% 50%)",
    centreNumber: "GB123",
    candidateNumber: "0043",
    enrolledSubjects: ["9618", "9709"],
  },
];

export const findUserByEmail = (email: string) =>
  users.find((u) => u.email.toLowerCase() === email.toLowerCase());

export const findUserById = (id: string) => users.find((u) => u.id === id);
