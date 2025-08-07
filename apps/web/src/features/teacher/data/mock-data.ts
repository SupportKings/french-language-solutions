export interface Class {
  id: string;
  date: Date;
  time: string;
  level: string;
  cohortName: string;
  attendanceMarked: boolean;
  homeworkUploaded: boolean;
  materialsCount: number;
  studentsCount: number;
  room?: string;
}

export interface PendingAction {
  id: string;
  type: "attendance" | "homework" | "materials";
  classId: string;
  className: string;
  date: Date;
  priority: "high" | "medium" | "low";
  overdue: boolean;
}

export interface StudentFlag {
  id: string;
  name: string;
  attendancePercentage: number;
  homeworkCompletion: number;
  lastAttended: Date;
  flagReason: string;
  level: string;
}

export interface TeacherFile {
  id: string;
  name: string;
  type: "pdf" | "excel" | "doc" | "folder" | "tracking";
  size?: string;
  uploadedDate: Date;
  path: string;
  children?: TeacherFile[];
}

export interface ActivitySummary {
  classesThisWeek: number;
  homeworksUploaded: number;
  attendanceCompleted: number;
  pendingTasks: number;
  studentMessages: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  level: string;
  attendancePercentage: number;
  homeworkCompletionPercentage: number;
  lastAttendedClass: Date | null;
  totalClasses: number;
  classesAttended: number;
  totalHomeworks: number;
  homeworksCompleted: number;
  nextClass: Date | null;
  status: "active" | "at-risk" | "inactive";
  joinedDate: Date;
  cohort: string;
}

export interface StudentSummary {
  totalAssignedStudents: number;
  avgAttendanceRate: number;
  avgHomeworkCompletionRate: number;
  studentsUnder60Attendance: number;
  studentsNotSubmittingHomework: number;
  studentsFallingBehind: number;
}

// Mock Data
export const upcomingClasses: Class[] = [
  {
    id: "1",
    date: new Date("2024-01-15T10:00:00"),
    time: "10:00 AM - 11:30 AM",
    level: "A1.5",
    cohortName: "Beginners Group A",
    attendanceMarked: false,
    homeworkUploaded: false,
    materialsCount: 3,
    studentsCount: 12,
    room: "Room 201"
  },
  {
    id: "2",
    date: new Date("2024-01-15T14:00:00"),
    time: "2:00 PM - 3:30 PM",
    level: "B2.1",
    cohortName: "Advanced Conversation",
    attendanceMarked: true,
    homeworkUploaded: true,
    materialsCount: 5,
    studentsCount: 8,
    room: "Room 105"
  },
  {
    id: "3",
    date: new Date("2024-01-16T09:00:00"),
    time: "9:00 AM - 10:30 AM",
    level: "A2.3",
    cohortName: "Elementary Plus",
    attendanceMarked: false,
    homeworkUploaded: true,
    materialsCount: 4,
    studentsCount: 10,
    room: "Room 203"
  },
  {
    id: "4",
    date: new Date("2024-01-16T16:00:00"),
    time: "4:00 PM - 5:30 PM",
    level: "B1.2",
    cohortName: "Intermediate Intensive",
    attendanceMarked: false,
    homeworkUploaded: false,
    materialsCount: 2,
    studentsCount: 15,
    room: "Online"
  },
  {
    id: "5",
    date: new Date("2024-01-17T11:00:00"),
    time: "11:00 AM - 12:30 PM",
    level: "C1.1",
    cohortName: "Professional French",
    attendanceMarked: false,
    homeworkUploaded: false,
    materialsCount: 6,
    studentsCount: 6,
    room: "Room 301"
  }
];

export const pendingActions: PendingAction[] = [
  {
    id: "1",
    type: "attendance",
    classId: "1",
    className: "A1.5 - Beginners Group A",
    date: new Date("2024-01-14T10:00:00"),
    priority: "high",
    overdue: true
  },
  {
    id: "2",
    type: "homework",
    classId: "3",
    className: "A2.3 - Elementary Plus",
    date: new Date("2024-01-16T09:00:00"),
    priority: "medium",
    overdue: false
  },
  {
    id: "3",
    type: "materials",
    classId: "4",
    className: "B1.2 - Intermediate Intensive",
    date: new Date("2024-01-16T16:00:00"),
    priority: "low",
    overdue: false
  },
  {
    id: "4",
    type: "attendance",
    classId: "2",
    className: "B2.1 - Advanced Conversation",
    date: new Date("2024-01-13T14:00:00"),
    priority: "high",
    overdue: true
  }
];

export const studentRedFlags: StudentFlag[] = [
  {
    id: "1",
    name: "Marie Dubois",
    attendancePercentage: 45,
    homeworkCompletion: 30,
    lastAttended: new Date("2024-01-08"),
    flagReason: "Low attendance and missing assignments",
    level: "A1.5"
  },
  {
    id: "2",
    name: "Jean-Pierre Martin",
    attendancePercentage: 60,
    homeworkCompletion: 20,
    lastAttended: new Date("2024-01-10"),
    flagReason: "Consistently missing homework",
    level: "B1.2"
  },
  {
    id: "3",
    name: "Sophie Laurent",
    attendancePercentage: 55,
    homeworkCompletion: 65,
    lastAttended: new Date("2024-01-11"),
    flagReason: "Irregular attendance pattern",
    level: "A2.3"
  },
  {
    id: "4",
    name: "Thomas Bernard",
    attendancePercentage: 25,
    homeworkCompletion: 40,
    lastAttended: new Date("2024-01-05"),
    flagReason: "At risk of dropping out",
    level: "B2.1"
  }
];

export const teacherFiles: TeacherFile[] = [
  {
    id: "1",
    name: "Materials",
    type: "folder",
    uploadedDate: new Date("2024-01-01"),
    path: "/materials",
    children: [
      {
        id: "11",
        name: "Grammar Exercises A1.pdf",
        type: "pdf",
        size: "2.4 MB",
        uploadedDate: new Date("2024-01-10"),
        path: "/materials/grammar-a1.pdf"
      },
      {
        id: "12",
        name: "Vocabulary Lists.xlsx",
        type: "excel",
        size: "1.1 MB",
        uploadedDate: new Date("2024-01-12"),
        path: "/materials/vocabulary.xlsx"
      },
      {
        id: "13",
        name: "Quebec Immigration Guide.pdf",
        type: "pdf",
        size: "5.2 MB",
        uploadedDate: new Date("2024-01-08"),
        path: "/materials/quebec-guide.pdf"
      },
      {
        id: "14",
        name: "Pronunciation Guide.doc",
        type: "doc",
        size: "3.7 MB",
        uploadedDate: new Date("2024-01-14"),
        path: "/materials/pronunciation.doc"
      }
    ]
  },
  {
    id: "2",
    name: "Student Info",
    type: "folder",
    uploadedDate: new Date("2024-01-01"),
    path: "/student-info",
    children: [
      {
        id: "21",
        name: "Marie_Dubois_Profile.pdf",
        type: "pdf",
        size: "450 KB",
        uploadedDate: new Date("2024-01-05"),
        path: "/student-info/marie-dubois.pdf"
      },
      {
        id: "22",
        name: "Jean_Pierre_Martin_Profile.pdf",
        type: "pdf",
        size: "380 KB",
        uploadedDate: new Date("2024-01-05"),
        path: "/student-info/jean-pierre.pdf"
      },
      {
        id: "23",
        name: "Student_Contact_List.xlsx",
        type: "excel",
        size: "120 KB",
        uploadedDate: new Date("2024-01-03"),
        path: "/student-info/contact-list.xlsx"
      }
    ]
  },
  {
    id: "3",
    name: "Student Classes",
    type: "folder",
    uploadedDate: new Date("2024-01-01"),
    path: "/student-classes",
    children: [
      {
        id: "31",
        name: "Marie Dubois",
        type: "folder",
        uploadedDate: new Date("2024-01-05"),
        path: "/student-classes/marie-dubois",
        children: [
          {
            id: "311",
            name: "Tracking_Sheet_Marie.xlsx",
            type: "tracking",
            size: "85 KB",
            uploadedDate: new Date("2024-01-14"),
            path: "/student-classes/marie-dubois/tracking.xlsx"
          },
          {
            id: "312",
            name: "Homework",
            type: "folder",
            uploadedDate: new Date("2024-01-05"),
            path: "/student-classes/marie-dubois/homework",
            children: [
              {
                id: "3121",
                name: "Week1_Assignment.pdf",
                type: "pdf",
                size: "1.2 MB",
                uploadedDate: new Date("2024-01-07"),
                path: "/student-classes/marie-dubois/homework/week1.pdf"
              },
              {
                id: "3122",
                name: "Week2_Assignment.pdf",
                type: "pdf",
                size: "980 KB",
                uploadedDate: new Date("2024-01-14"),
                path: "/student-classes/marie-dubois/homework/week2.pdf"
              }
            ]
          },
          {
            id: "313",
            name: "Presentations",
            type: "folder",
            uploadedDate: new Date("2024-01-05"),
            path: "/student-classes/marie-dubois/presentations",
            children: [
              {
                id: "3131",
                name: "French_Culture_Presentation.pptx",
                type: "doc",
                size: "15.3 MB",
                uploadedDate: new Date("2024-01-10"),
                path: "/student-classes/marie-dubois/presentations/culture.pptx"
              }
            ]
          }
        ]
      },
      {
        id: "32",
        name: "Jean-Pierre Martin",
        type: "folder",
        uploadedDate: new Date("2024-01-05"),
        path: "/student-classes/jean-pierre",
        children: [
          {
            id: "321",
            name: "Tracking_Sheet_JeanPierre.xlsx",
            type: "tracking",
            size: "92 KB",
            uploadedDate: new Date("2024-01-14"),
            path: "/student-classes/jean-pierre/tracking.xlsx"
          },
          {
            id: "322",
            name: "Homework",
            type: "folder",
            uploadedDate: new Date("2024-01-05"),
            path: "/student-classes/jean-pierre/homework",
            children: []
          }
        ]
      }
    ]
  }
];

export const activitySummary: ActivitySummary = {
  classesThisWeek: 12,
  homeworksUploaded: 8,
  attendanceCompleted: 10,
  pendingTasks: 4,
  studentMessages: 3
};

export const students: Student[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    level: "A1.5",
    attendancePercentage: 58,
    homeworkCompletionPercentage: 40,
    lastAttendedClass: new Date("2024-01-12"),
    totalClasses: 24,
    classesAttended: 14,
    totalHomeworks: 20,
    homeworksCompleted: 8,
    nextClass: new Date("2024-01-16T10:00:00"),
    status: "at-risk",
    joinedDate: new Date("2023-11-01"),
    cohort: "Beginners Group A"
  },
  {
    id: "2",
    name: "Amélie Rousseau",
    email: "amelie.r@example.com",
    level: "B1.2",
    attendancePercentage: 72,
    homeworkCompletionPercentage: 60,
    lastAttendedClass: new Date("2024-01-14"),
    totalClasses: 32,
    classesAttended: 23,
    totalHomeworks: 25,
    homeworksCompleted: 15,
    nextClass: new Date("2024-01-16T16:00:00"),
    status: "active",
    joinedDate: new Date("2023-10-15"),
    cohort: "Intermediate Intensive"
  },
  {
    id: "3",
    name: "Camille Tremblay",
    email: "camille.t@example.com",
    level: "A2.3",
    attendancePercentage: 94,
    homeworkCompletionPercentage: 88,
    lastAttendedClass: new Date("2024-01-15"),
    totalClasses: 36,
    classesAttended: 34,
    totalHomeworks: 30,
    homeworksCompleted: 26,
    nextClass: new Date("2024-01-16T09:00:00"),
    status: "active",
    joinedDate: new Date("2023-09-01"),
    cohort: "Elementary Plus"
  },
  {
    id: "4",
    name: "Marie Dubois",
    email: "marie.d@example.com",
    level: "A1.5",
    attendancePercentage: 45,
    homeworkCompletionPercentage: 30,
    lastAttendedClass: new Date("2024-01-08"),
    totalClasses: 24,
    classesAttended: 11,
    totalHomeworks: 20,
    homeworksCompleted: 6,
    nextClass: new Date("2024-01-16T10:00:00"),
    status: "at-risk",
    joinedDate: new Date("2023-11-01"),
    cohort: "Beginners Group A"
  },
  {
    id: "5",
    name: "Jean-Pierre Martin",
    email: "jp.martin@example.com",
    level: "B1.2",
    attendancePercentage: 60,
    homeworkCompletionPercentage: 20,
    lastAttendedClass: new Date("2024-01-10"),
    totalClasses: 32,
    classesAttended: 19,
    totalHomeworks: 25,
    homeworksCompleted: 5,
    nextClass: new Date("2024-01-16T16:00:00"),
    status: "at-risk",
    joinedDate: new Date("2023-10-15"),
    cohort: "Intermediate Intensive"
  },
  {
    id: "6",
    name: "Sophie Laurent",
    email: "sophie.l@example.com",
    level: "A2.3",
    attendancePercentage: 55,
    homeworkCompletionPercentage: 65,
    lastAttendedClass: new Date("2024-01-11"),
    totalClasses: 36,
    classesAttended: 20,
    totalHomeworks: 30,
    homeworksCompleted: 20,
    nextClass: new Date("2024-01-16T09:00:00"),
    status: "at-risk",
    joinedDate: new Date("2023-09-01"),
    cohort: "Elementary Plus"
  },
  {
    id: "7",
    name: "Thomas Bernard",
    email: "thomas.b@example.com",
    level: "B2.1",
    attendancePercentage: 25,
    homeworkCompletionPercentage: 40,
    lastAttendedClass: new Date("2024-01-05"),
    totalClasses: 40,
    classesAttended: 10,
    totalHomeworks: 35,
    homeworksCompleted: 14,
    nextClass: new Date("2024-01-15T14:00:00"),
    status: "inactive",
    joinedDate: new Date("2023-08-15"),
    cohort: "Advanced Conversation"
  },
  {
    id: "8",
    name: "Lucas Girard",
    email: "lucas.g@example.com",
    level: "C1.1",
    attendancePercentage: 85,
    homeworkCompletionPercentage: 92,
    lastAttendedClass: new Date("2024-01-15"),
    totalClasses: 28,
    classesAttended: 24,
    totalHomeworks: 24,
    homeworksCompleted: 22,
    nextClass: new Date("2024-01-17T11:00:00"),
    status: "active",
    joinedDate: new Date("2023-09-15"),
    cohort: "Professional French"
  },
  {
    id: "9",
    name: "Emma Lefebvre",
    email: "emma.l@example.com",
    level: "B2.1",
    attendancePercentage: 90,
    homeworkCompletionPercentage: 85,
    lastAttendedClass: new Date("2024-01-15"),
    totalClasses: 40,
    classesAttended: 36,
    totalHomeworks: 35,
    homeworksCompleted: 30,
    nextClass: new Date("2024-01-15T14:00:00"),
    status: "active",
    joinedDate: new Date("2023-08-15"),
    cohort: "Advanced Conversation"
  },
  {
    id: "10",
    name: "Alexandre Moreau",
    email: "alex.m@example.com",
    level: "A1.5",
    attendancePercentage: 78,
    homeworkCompletionPercentage: 70,
    lastAttendedClass: new Date("2024-01-14"),
    totalClasses: 24,
    classesAttended: 19,
    totalHomeworks: 20,
    homeworksCompleted: 14,
    nextClass: new Date("2024-01-16T10:00:00"),
    status: "active",
    joinedDate: new Date("2023-11-01"),
    cohort: "Beginners Group A"
  },
  {
    id: "11",
    name: "Isabelle Roy",
    email: "isabelle.r@example.com",
    level: "C1.1",
    attendancePercentage: 95,
    homeworkCompletionPercentage: 98,
    lastAttendedClass: new Date("2024-01-15"),
    totalClasses: 28,
    classesAttended: 27,
    totalHomeworks: 24,
    homeworksCompleted: 24,
    nextClass: new Date("2024-01-17T11:00:00"),
    status: "active",
    joinedDate: new Date("2023-09-15"),
    cohort: "Professional French"
  },
  {
    id: "12",
    name: "Nicolas Petit",
    email: "nicolas.p@example.com",
    level: "A2.3",
    attendancePercentage: 82,
    homeworkCompletionPercentage: 75,
    lastAttendedClass: new Date("2024-01-15"),
    totalClasses: 36,
    classesAttended: 30,
    totalHomeworks: 30,
    homeworksCompleted: 23,
    nextClass: new Date("2024-01-16T09:00:00"),
    status: "active",
    joinedDate: new Date("2023-09-01"),
    cohort: "Elementary Plus"
  }
];

export const studentSummary: StudentSummary = {
  totalAssignedStudents: students.length,
  avgAttendanceRate: Math.round(students.reduce((sum, s) => sum + s.attendancePercentage, 0) / students.length),
  avgHomeworkCompletionRate: Math.round(students.reduce((sum, s) => sum + s.homeworkCompletionPercentage, 0) / students.length),
  studentsUnder60Attendance: students.filter(s => s.attendancePercentage < 60).length,
  studentsNotSubmittingHomework: students.filter(s => s.homeworkCompletionPercentage < 30).length,
  studentsFallingBehind: students.filter(s => s.status === "at-risk" || s.status === "inactive").length
};

// Helper functions
export const getLevelColor = (level: string): string => {
  if (level.startsWith("A1") || level.startsWith("A2")) return "text-green-600 bg-green-50";
  if (level.startsWith("B1") || level.startsWith("B2")) return "text-blue-600 bg-blue-50";
  if (level.startsWith("C1") || level.startsWith("C2")) return "text-purple-600 bg-purple-50";
  return "text-gray-600 bg-gray-50";
};

export const getAttendanceColor = (percentage: number): string => {
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 60) return "text-yellow-600";
  if (percentage >= 40) return "text-orange-600";
  return "text-red-600";
};

export const getFileIcon = (type: string): string => {
  switch (type) {
    case "pdf": return "📄";
    case "excel": return "📊";
    case "doc": return "📝";
    case "folder": return "📁";
    case "tracking": return "📈";
    default: return "📎";
  }
};