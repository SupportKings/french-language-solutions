"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion as m, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, Users, FileText, AlertCircle, 
  Upload, CheckCircle, FolderOpen, 
  ChevronRight, Mail, BookOpen,
  AlertTriangle, Send, Eye, Download,
  GraduationCap, Award, TrendingUp, BarChart3,
  Bell, Sparkles, Target, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  upcomingClasses, 
  pendingActions, 
  studentRedFlags,
  teacherFiles,
  activitySummary,
  students,
  studentSummary,
  getLevelColor,
  getAttendanceColor,
  getFileIcon
} from "@/features/teacher/data/mock-data";
import { toast } from "sonner";
import { format } from "date-fns";
import { UploadModal } from "@/features/teacher/components/upload-modal";
import { StudentsSummaryCard } from "@/features/teacher/components/students-summary-card";
import { StudentsList } from "@/features/teacher/components/students-list";
import { cn } from "@/lib/utils";

export default function TeacherDashboard() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedStatCard, setSelectedStatCard] = useState<string | null>(null);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleMarkAttendance = (classId: string) => {
    toast.success("Attendance marked successfully!");
  };

  const handleUploadHomework = (classId: string) => {
    setSelectedClass(classId);
    setUploadModalOpen(true);
  };

  const handleOpenClass = (classId: string) => {
    toast.info(`Opening class ${classId} details...`);
  };

  const handleSendMessage = (studentId: string) => {
    toast.info("Opening message composer...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-red-50/20">


      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#004990] to-[#75a1de] rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#004990]">Teacher Dashboard</h1>
                <p className="text-sm text-slate-600">Welcome back, Opskings Support</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {activitySummary.pendingTasks > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#f80003] text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {activitySummary.pendingTasks}
                  </span>
                )}
              </Button>
              
              <Button variant="outline" size="sm" className="relative">
                <Mail className="h-4 w-4" />
                {activitySummary.studentMessages > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#f80003] text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {activitySummary.studentMessages}
                  </span>
                )}
              </Button>

              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <Avatar className="h-9 w-9 border-2 border-[#75a1de]">
                  <AvatarImage src="/avatar.jpg" />
                  <AvatarFallback className="bg-gradient-to-br from-[#004990] to-[#75a1de] text-white">
                    PM
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          {/* Welcome Banner */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gradient-to-r from-[#004990] via-[#75a1de] to-[#e9f3fe] rounded-2xl p-6 text-white shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
                    Have a great teaching day! <Sparkles className="h-5 w-5 text-yellow-300" />
                  </h2>
                  <p className="text-blue-100">
                    {format(new Date(), "EEEE, MMMM dd, yyyy")} • You have {activitySummary.classesThisWeek} classes this week
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button className="bg-white text-[#004990] hover:bg-slate-100 shadow-lg font-medium">
                    <Zap className="h-4 w-4 mr-2" />
                    Quick Actions
                  </Button>
                </div>
              </div>
            </div>
          </m.div>
        </div>

        {/* Compact Stats Cards */}
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
        >
          {/* Classes This Week */}
          <m.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStatCard('classes')}
            className="cursor-pointer relative group"
          >
            <Card className="h-[110px] bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-md hover:shadow-xl hover:border-blue-200 transition-all overflow-hidden">
              <CardContent className="p-4 h-full flex flex-col justify-between relative">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <Calendar className="h-4 w-4 text-[#004990]" />
                  </div>
                  <span className="text-3xl font-bold text-[#004990]">
                    {activitySummary.classesThisWeek}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-slate-700">Classes This Week</p>
                  <p className="text-xs text-slate-500 group-hover:text-blue-500 transition-colors">Click to view details →</p>
                </div>
              </CardContent>
            </Card>
          </m.div>

          {/* Missed Attendance Markings */}
          <m.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStatCard('attendance')}
            className="cursor-pointer relative group"
          >
            <Card className="h-[110px] bg-gradient-to-br from-white to-orange-50 border border-orange-100 shadow-md hover:shadow-xl hover:border-orange-200 transition-all overflow-hidden">
              <CardContent className="p-4 h-full flex flex-col justify-between relative">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-4 w-4 text-orange-400" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <Users className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-orange-600">
                      {upcomingClasses.filter(c => !c.attendanceMarked && new Date(c.date) < new Date()).length}
                    </span>
                    {upcomingClasses.filter(c => !c.attendanceMarked && new Date(c.date) < new Date()).length > 0 && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-slate-700">Missed Attendance</p>
                  <p className="text-xs text-slate-500 group-hover:text-orange-500 transition-colors">Click to mark now →</p>
                </div>
              </CardContent>
            </Card>
          </m.div>

          {/* Late Homework Uploads */}
          <m.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStatCard('homework')}
            className="cursor-pointer relative group"
          >
            <Card className="h-[110px] bg-gradient-to-br from-white to-purple-50 border border-purple-100 shadow-md hover:shadow-xl hover:border-purple-200 transition-all overflow-hidden">
              <CardContent className="p-4 h-full flex flex-col justify-between relative">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-4 w-4 text-purple-400" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <Upload className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="text-3xl font-bold text-purple-600">
                    {upcomingClasses.filter(c => !c.homeworkUploaded).length}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-slate-700">Late Homework</p>
                  <p className="text-xs text-slate-500 group-hover:text-purple-500 transition-colors">Click to upload →</p>
                </div>
              </CardContent>
            </Card>
          </m.div>

          {/* Students Requiring Attention */}
          <m.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStatCard('students')}
            className="cursor-pointer relative group"
          >
            <Card className="h-[110px] bg-gradient-to-br from-white to-red-50 border border-red-100 shadow-md hover:shadow-xl hover:border-red-200 transition-all overflow-hidden">
              <CardContent className="p-4 h-full flex flex-col justify-between relative">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-4 w-4 text-red-400" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <AlertTriangle className="h-4 w-4 text-[#f80003]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-[#f80003]">
                      {students.filter(s => 
                        s.attendancePercentage < 60 || 
                        s.homeworkCompletionPercentage < 50 ||
                        (s.totalHomeworks - s.homeworksCompleted) >= 2
                      ).length}
                    </span>
                    {students.filter(s => 
                      s.attendancePercentage < 60 || 
                      s.homeworkCompletionPercentage < 50
                    ).length > 0 && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-slate-700">Students Need Help</p>
                  <p className="text-xs text-slate-500 group-hover:text-red-500 transition-colors">Click for details →</p>
                </div>
              </CardContent>
            </Card>
          </m.div>
        </m.div>

        {/* Enhanced Tabs with Modern Design */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <m.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Tab Container with Glass Effect */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-2">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-50/50 to-blue-50/30 p-1.5 h-auto gap-2 rounded-xl">
              <TabsTrigger 
                value="overview" 
                className="group relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 rounded-xl font-medium text-slate-600 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#004990] data-[state=active]:to-[#75a1de] data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white hover:shadow-md data-[state=active]:hover:shadow-xl data-[state=active]:scale-[1.02]"
              >
                <BarChart3 className="h-5 w-5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:scale-110 group-data-[state=active]:rotate-[360deg]" />
                <span className="text-xs sm:text-sm">Overview</span>
                <m.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 hidden data-[state=active]:block"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                </m.div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="classes" 
                className="group relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 rounded-xl font-medium text-slate-600 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#004990] data-[state=active]:to-[#75a1de] data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white hover:shadow-md data-[state=active]:hover:shadow-xl data-[state=active]:scale-[1.02]"
              >
                <div className="relative">
                  <Calendar className="h-5 w-5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:scale-110" />
                  {upcomingClasses.filter(c => !c.attendanceMarked).length > 0 && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
                      {upcomingClasses.filter(c => !c.attendanceMarked).length}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm">Classes</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="students" 
                className="group relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 rounded-xl font-medium text-slate-600 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#004990] data-[state=active]:to-[#75a1de] data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white hover:shadow-md data-[state=active]:hover:shadow-xl data-[state=active]:scale-[1.02]"
              >
                <div className="relative">
                  <Users className="h-5 w-5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:scale-110" />
                  {studentSummary.studentsFallingBehind > 0 && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
                      {studentSummary.studentsFallingBehind}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm">Students</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="files" 
                className="group relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 rounded-xl font-medium text-slate-600 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#004990] data-[state=active]:to-[#75a1de] data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white hover:shadow-md data-[state=active]:hover:shadow-xl data-[state=active]:scale-[1.02]"
              >
                <FolderOpen className="h-5 w-5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-xs sm:text-sm">Files</span>
              </TabsTrigger>
            </TabsList>
            </div>
            
            {/* Tab Indicator Line */}
            <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#004990]/20 to-transparent" />
          </m.div>

          <TabsContent value="overview" className="space-y-6">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Pending Actions Card */}
              <Card className="bg-white border-0 shadow-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-[#f80003] via-orange-500 to-yellow-500" />
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      </div>
                      Pending Actions
                    </span>
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      {pendingActions.length} items
                    </Badge>
                  </CardTitle>
                  <CardDescription>Tasks requiring your immediate attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingActions.map((action, index) => (
                    <m.div
                      key={action.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-transparent hover:shadow-md transition-all hover:border-[#75a1de]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            action.type === "attendance" && "bg-blue-100",
                            action.type === "homework" && "bg-green-100",
                            action.type === "materials" && "bg-purple-100"
                          )}>
                            {action.type === "attendance" && <Users className="h-4 w-4 text-blue-600" />}
                            {action.type === "homework" && <FileText className="h-4 w-4 text-green-600" />}
                            {action.type === "materials" && <FolderOpen className="h-4 w-4 text-purple-600" />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{action.className}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <p className="text-xs text-slate-500">
                                {format(action.date, "MMM dd, h:mm a")}
                              </p>
                              {action.overdue && (
                                <Badge variant="destructive" className="text-xs scale-90">
                                  Overdue
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className={cn(
                            "transition-all font-medium",
                            action.priority === "high" 
                              ? "bg-gradient-to-r from-[#f80003] to-[#90000d] text-white hover:shadow-lg" 
                              : "bg-white text-slate-700 border border-slate-200 hover:border-[#75a1de] hover:bg-blue-50"
                          )}
                          onClick={() => {
                            if (action.type === "attendance") handleMarkAttendance(action.classId);
                            if (action.type === "homework") handleUploadHomework(action.classId);
                          }}
                        >
                          {action.type === "attendance" && "Mark"}
                          {action.type === "homework" && "Upload"}
                          {action.type === "materials" && "Add"}
                          <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </m.div>
                  ))}
                </CardContent>
              </Card>

              {/* Student Alerts Card */}
              <Card className="bg-white border-0 shadow-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-red-500 via-red-400 to-pink-500" />
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      Student Alerts
                    </span>
                    <Badge variant="outline" className="border-red-300 text-red-700">
                      {studentRedFlags.length} at risk
                    </Badge>
                  </CardTitle>
                  <CardDescription>Students needing additional support</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {studentRedFlags.map((student, index) => (
                    <m.div
                      key={student.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-red-50 to-transparent hover:shadow-md transition-all hover:border-red-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-slate-900">{student.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={cn("scale-90", getLevelColor(student.level))} variant="secondary">
                              {student.level}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              Last seen: {format(student.lastAttended, "MMM dd")}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="hover:bg-blue-50"
                            onClick={() => router.push(`/teacher/students/${student.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="hover:bg-blue-50"
                            onClick={() => handleSendMessage(student.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                          <Target className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Attendance</p>
                            <p className={cn(
                              "text-sm font-bold",
                              getAttendanceColor(student.attendancePercentage)
                            )}>
                              {student.attendancePercentage}%
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                          <BookOpen className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Homework</p>
                            <p className={cn(
                              "text-sm font-bold",
                              getAttendanceColor(student.homeworkCompletion)
                            )}>
                              {student.homeworkCompletion}%
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-xs text-red-700 flex items-start gap-1">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {student.flagReason}
                        </p>
                      </div>
                    </m.div>
                  ))}
                </CardContent>
              </Card>
            </m.div>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="bg-white border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    Upcoming Classes
                  </CardTitle>
                  <CardDescription>Your teaching schedule for this week</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimatePresence mode="wait">
                    {upcomingClasses.map((cls, index) => (
                      <m.div
                        key={cls.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="group p-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 hover:shadow-lg transition-all hover:border-[#75a1de]"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="text-center p-3 bg-gradient-to-br from-[#004990] to-[#75a1de] rounded-xl text-white shadow-md">
                              <div className="text-2xl font-bold">{format(cls.date, "dd")}</div>
                              <div className="text-xs uppercase">{format(cls.date, "MMM")}</div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={cn("font-bold", getLevelColor(cls.level))} variant="secondary">
                                  {cls.level}
                                </Badge>
                                <span className="font-semibold text-lg text-slate-900">{cls.cohortName}</span>
                                {cls.room && (
                                  <Badge variant="outline" className="text-xs border-slate-300">
                                    {cls.room}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {cls.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {cls.studentsCount} students
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  {cls.materialsCount} materials
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                <Badge 
                                  variant={cls.attendanceMarked ? "default" : "secondary"}
                                  className={cls.attendanceMarked ? "bg-green-100 text-green-700 border-green-300" : ""}
                                >
                                  {cls.attendanceMarked ? (
                                    <><CheckCircle className="h-3 w-3 mr-1" /> Attendance done</>
                                  ) : (
                                    <><Clock className="h-3 w-3 mr-1" /> Attendance pending</>
                                  )}
                                </Badge>
                                <Badge 
                                  variant={cls.homeworkUploaded ? "default" : "secondary"}
                                  className={cls.homeworkUploaded ? "bg-blue-100 text-blue-700 border-blue-300" : ""}
                                >
                                  {cls.homeworkUploaded ? (
                                    <><CheckCircle className="h-3 w-3 mr-1" /> Homework ready</>
                                  ) : (
                                    <><Upload className="h-3 w-3 mr-1" /> Upload homework</>
                                  )}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!cls.attendanceMarked && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-slate-700 border-slate-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700 font-medium"
                                onClick={() => handleMarkAttendance(cls.id)}
                              >
                                Mark Attendance
                              </Button>
                            )}
                            <Button 
                              onClick={() => handleOpenClass(cls.id)}
                              className="bg-gradient-to-r from-[#004990] to-[#75a1de] text-white hover:shadow-lg gap-2 font-medium"
                            >
                              Open Class <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </m.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </m.div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <StudentsSummaryCard summary={studentSummary} />
              <StudentsList students={students} />
            </m.div>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="bg-white border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FolderOpen className="h-5 w-5 text-purple-600" />
                    </div>
                    Teaching Materials
                  </CardTitle>
                  <CardDescription>Your files and student documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileExplorer 
                    files={teacherFiles} 
                    expandedFolders={expandedFolders}
                    toggleFolder={toggleFolder}
                  />
                </CardContent>
              </Card>
            </m.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Upload Modal */}
      <UploadModal 
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setSelectedClass(null);
        }}
        classId={selectedClass}
        type="homework"
      />

      {/* Stats Details Dialog */}
      <Dialog open={!!selectedStatCard} onOpenChange={() => setSelectedStatCard(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
          {selectedStatCard === 'classes' && (
            <>
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="h-5 w-5 text-[#004990]" />
                  Classes This Week
                </DialogTitle>
                <DialogDescription>
                  You have {activitySummary.classesThisWeek} classes scheduled this week
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-2 max-h-[60vh] overflow-auto">
                {upcomingClasses.map((cls) => (
                  <div 
                    key={cls.id} 
                    className="p-3 rounded-lg border bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[40px]">
                          <div className="text-sm font-bold text-[#004990]">{format(cls.date, "dd")}</div>
                          <div className="text-xs text-slate-500">{format(cls.date, "MMM")}</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{cls.cohortName}</p>
                            <Badge className={cn("text-xs scale-90", getLevelColor(cls.level))} variant="secondary">
                              {cls.level}
                            </Badge>
                            {cls.room && (
                              <Badge variant="outline" className="text-xs scale-90">{cls.room}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {cls.time} • {cls.studentsCount} students • {cls.materialsCount} materials
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenClass(cls.id)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {selectedStatCard === 'attendance' && (
            <>
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-5 w-5 text-orange-500" />
                  Missed Attendance Markings
                </DialogTitle>
                <DialogDescription>
                  These classes need attendance marking from the past week
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-2 max-h-[60vh] overflow-auto">
                {upcomingClasses
                  .filter(c => !c.attendanceMarked && new Date(c.date) < new Date())
                  .map((cls) => (
                    <div 
                      key={cls.id} 
                      className="p-3 rounded-lg border border-orange-200 bg-orange-50/30 hover:bg-orange-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{cls.cohortName}</p>
                              <Badge className="text-xs scale-90 bg-orange-100 text-orange-700 border-0">
                                {Math.floor((new Date().getTime() - cls.date.getTime()) / (1000 * 60 * 60 * 24))} days overdue
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {format(cls.date, "EEEE, MMM dd")} • {cls.time}
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleMarkAttendance(cls.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          Mark Now
                        </Button>
                      </div>
                    </div>
                  ))}
                {upcomingClasses.filter(c => !c.attendanceMarked && new Date(c.date) < new Date()).length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <p className="text-slate-500">All attendance markings are up to date!</p>
                  </div>
                )}
              </div>
            </>
          )}

          {selectedStatCard === 'homework' && (
            <>
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Upload className="h-5 w-5 text-purple-500" />
                  Late Homework Uploads
                </DialogTitle>
                <DialogDescription>
                  Classes that are missing homework uploads
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-2 max-h-[60vh] overflow-auto">
                {upcomingClasses
                  .filter(c => !c.homeworkUploaded)
                  .map((cls) => (
                    <div 
                      key={cls.id} 
                      className="p-3 rounded-lg border border-purple-200 bg-purple-50/30 hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-purple-500" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{cls.cohortName}</p>
                              <Badge variant="outline" className="text-xs scale-90 border-purple-300 text-purple-700">
                                {cls.studentsCount} students
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {format(cls.date, "EEEE, MMM dd")} • {cls.time}
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleUploadHomework(cls.id)}
                          className="bg-purple-500 hover:bg-purple-600 text-white"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          {selectedStatCard === 'students' && (
            <>
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Students Requiring Attention
                </DialogTitle>
                <DialogDescription>
                  Students with attendance below 60%, homework below 50%, or 2+ missed assignments
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-2 max-h-[60vh] overflow-auto">
                {students
                  .filter(s => 
                    s.attendancePercentage < 60 || 
                    s.homeworkCompletionPercentage < 50 ||
                    (s.totalHomeworks - s.homeworksCompleted) >= 2
                  )
                  .map((student) => (
                    <div 
                      key={student.id} 
                      className="p-3 rounded-lg border border-red-200 bg-red-50/30 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-red-100 text-red-700 text-xs font-semibold">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{student.name}</p>
                              <span className="text-xs text-slate-500">{student.level} • {student.cohort}</span>
                            </div>
                            <div className="flex gap-3 mt-1">
                              <span className={cn(
                                "text-xs",
                                student.attendancePercentage < 60 ? "text-red-600 font-medium" : "text-slate-500"
                              )}>
                                Attendance: {student.attendancePercentage}%
                              </span>
                              <span className={cn(
                                "text-xs",
                                student.homeworkCompletionPercentage < 50 ? "text-red-600 font-medium" : "text-slate-500"
                              )}>
                                Homework: {student.homeworkCompletionPercentage}%
                              </span>
                              {(student.totalHomeworks - student.homeworksCompleted) >= 2 && (
                                <span className="text-xs text-red-600 font-medium">
                                  {student.totalHomeworks - student.homeworksCompleted} missed HW
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedStatCard(null);
                              router.push(`/teacher/students/${student.id}`);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleSendMessage(student.id)}
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Enhanced File Explorer Component
function FileExplorer({ 
  files, 
  expandedFolders, 
  toggleFolder, 
  level = 0 
}: { 
  files: any[], 
  expandedFolders: Set<string>, 
  toggleFolder: (id: string) => void,
  level?: number 
}) {
  return (
    <div className="space-y-1">
      {files.map((file) => (
        <div key={file.id}>
          <m.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group",
              file.type === "folder" && "font-medium"
            )}
            style={{ paddingLeft: `${level * 24 + 12}px` }}
            onClick={() => file.type === "folder" && toggleFolder(file.id)}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{getFileIcon(file.type)}</span>
              <span className="text-sm">{file.name}</span>
              {file.size && (
                <Badge variant="outline" className="text-xs scale-90">
                  {file.size}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                {format(file.uploadedDate, "MMM dd, yyyy")}
              </span>
              {file.type !== "folder" && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info(`Downloading ${file.name}...`);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              {file.type === "folder" && (
                <ChevronRight className={cn(
                  "h-4 w-4 transition-transform text-slate-400",
                  expandedFolders.has(file.id) && "rotate-90"
                )} />
              )}
            </div>
          </m.div>
          <AnimatePresence>
            {file.children && expandedFolders.has(file.id) && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <FileExplorer 
                  files={file.children} 
                  expandedFolders={expandedFolders}
                  toggleFolder={toggleFolder}
                  level={level + 1}
                />
              </m.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}