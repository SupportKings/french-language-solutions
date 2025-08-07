"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion as m } from "framer-motion";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Mail, 
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Send,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";
import { students, getLevelColor } from "@/features/teacher/data/mock-data";

interface ClassRecord {
  id: string;
  date: Date;
  attended: boolean;
  homeworkSubmitted: boolean;
  notes?: string;
}

interface HomeworkRecord {
  id: string;
  assignedDate: Date;
  dueDate: Date;
  submittedDate?: Date;
  grade?: number;
  title: string;
  status: "pending" | "submitted" | "graded" | "late" | "missing";
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;
  
  const student = students.find(s => s.id === studentId);
  
  const [selectedTab, setSelectedTab] = useState("overview");

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-center">Student not found</p>
            <Button 
              onClick={() => router.push("/teacher")} 
              className="mt-4 w-full"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mockClassRecords: ClassRecord[] = [
    { id: "1", date: new Date("2024-01-15"), attended: true, homeworkSubmitted: true },
    { id: "2", date: new Date("2024-01-12"), attended: true, homeworkSubmitted: false },
    { id: "3", date: new Date("2024-01-10"), attended: false, homeworkSubmitted: false, notes: "Sick" },
    { id: "4", date: new Date("2024-01-08"), attended: true, homeworkSubmitted: true },
    { id: "5", date: new Date("2024-01-05"), attended: true, homeworkSubmitted: true },
  ];

  const mockHomeworkRecords: HomeworkRecord[] = [
    { 
      id: "1", 
      title: "Grammar Exercise - Past Tense",
      assignedDate: new Date("2024-01-12"), 
      dueDate: new Date("2024-01-15"),
      submittedDate: new Date("2024-01-14"),
      grade: 85,
      status: "graded"
    },
    { 
      id: "2", 
      title: "Vocabulary Quiz - Chapter 5",
      assignedDate: new Date("2024-01-10"), 
      dueDate: new Date("2024-01-12"),
      status: "missing"
    },
    { 
      id: "3", 
      title: "Essay: My Weekend",
      assignedDate: new Date("2024-01-08"), 
      dueDate: new Date("2024-01-10"),
      submittedDate: new Date("2024-01-11"),
      status: "late"
    },
    { 
      id: "4", 
      title: "Speaking Practice Recording",
      assignedDate: new Date("2024-01-15"), 
      dueDate: new Date("2024-01-18"),
      status: "pending"
    },
  ];

  const getStatusColor = (status: typeof student.status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700 border-green-200";
      case "at-risk": return "bg-orange-100 text-orange-700 border-orange-200";
      case "inactive": return "bg-red-100 text-red-700 border-red-200";
    }
  };

  const getHomeworkStatusBadge = (status: HomeworkRecord["status"]) => {
    switch (status) {
      case "graded":
        return <Badge className="bg-green-100 text-green-700">Graded</Badge>;
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-700">Submitted</Badge>;
      case "pending":
        return <Badge className="bg-gray-100 text-gray-700">Pending</Badge>;
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-700">Late</Badge>;
      case "missing":
        return <Badge className="bg-red-100 text-red-700">Missing</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push("/teacher")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getLevelColor(student.level)} variant="secondary">
                    {student.level}
                  </Badge>
                  <Badge className={getStatusColor(student.status)}>
                    {student.status === "at-risk" ? "At Risk" : 
                     student.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">• {student.cohort}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => toast.info("Opening message composer...")}>
                <Send className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" onClick={() => toast.info("Downloading student report...")}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full max-w-[400px] grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="homework">Homework</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Student Info Card */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-card/95 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Student Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{student.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Joined Date</p>
                      <p className="text-sm font-medium">
                        {format(student.joinedDate, "MMMM dd, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Class</p>
                      <p className="text-sm font-medium">
                        {student.nextClass 
                          ? format(student.nextClass, "MMM dd, h:mm a")
                          : "No upcoming class"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </m.div>

              {/* Performance Stats */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2"
              >
                <Card className="bg-card/95 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Attendance Rate</span>
                        <span className="text-sm font-medium">{student.attendancePercentage}%</span>
                      </div>
                      <Progress value={student.attendancePercentage} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {student.classesAttended} of {student.totalClasses} classes attended
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Homework Completion</span>
                        <span className="text-sm font-medium">{student.homeworkCompletionPercentage}%</span>
                      </div>
                      <Progress value={student.homeworkCompletionPercentage} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {student.homeworksCompleted} of {student.totalHomeworks} assignments completed
                      </p>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Last Attended Class</p>
                      <p className="text-sm font-medium">
                        {student.lastAttendedClass 
                          ? format(student.lastAttendedClass, "MMMM dd, yyyy")
                          : "Never attended"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </m.div>
            </div>

            {/* Recent Activity */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card/95 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Last 5 class sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockClassRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {format(record.date, "MMMM dd, yyyy")}
                            </p>
                            {record.notes && (
                              <p className="text-xs text-muted-foreground">{record.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={record.attended ? "default" : "secondary"}>
                            {record.attended ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Present</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1" /> Absent</>
                            )}
                          </Badge>
                          <Badge variant={record.homeworkSubmitted ? "default" : "secondary"}>
                            {record.homeworkSubmitted ? (
                              <><FileText className="h-3 w-3 mr-1" /> HW Done</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1" /> No HW</>
                            )}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </m.div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card className="bg-card/95 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>Complete attendance record for {student.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockClassRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors">
                      <div className="flex items-center gap-3">
                        {record.attended ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{format(record.date, "EEEE, MMMM dd, yyyy")}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.attended ? "Present" : `Absent${record.notes ? ` - ${record.notes}` : ""}`}
                          </p>
                        </div>
                      </div>
                      <Badge variant={record.attended ? "default" : "destructive"}>
                        {record.attended ? "Present" : "Absent"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Homework Tab */}
          <TabsContent value="homework">
            <Card className="bg-card/95 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Homework Assignments</CardTitle>
                <CardDescription>All homework assignments and submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockHomeworkRecords.map((homework) => (
                    <div key={homework.id} className="p-4 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{homework.title}</h4>
                            {getHomeworkStatusBadge(homework.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Assigned</p>
                              <p>{format(homework.assignedDate, "MMM dd")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Due</p>
                              <p>{format(homework.dueDate, "MMM dd")}</p>
                            </div>
                            {homework.submittedDate && (
                              <div>
                                <p className="text-muted-foreground">Submitted</p>
                                <p>{format(homework.submittedDate, "MMM dd")}</p>
                              </div>
                            )}
                            {homework.grade !== undefined && (
                              <div>
                                <p className="text-muted-foreground">Grade</p>
                                <p className="font-medium">{homework.grade}%</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}