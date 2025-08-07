"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Eye, 
  Send, 
  Search, 
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar
} from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Student } from "../data/mock-data";
import { getLevelColor, getAttendanceColor } from "../data/mock-data";

interface StudentsListProps {
  students: Student[];
}

export function StudentsList({ students }: StudentsListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "attendance" | "homework">("name");

  const uniqueLevels = useMemo(() => {
    const levels = new Set(students.map(s => s.level));
    return Array.from(levels).sort();
  }, [students]);

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const matchesSearch = searchQuery === "" || 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.cohort.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = filterLevel === "all" || student.level === filterLevel;
      const matchesStatus = filterStatus === "all" || student.status === filterStatus;

      return matchesSearch && matchesLevel && matchesStatus;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "attendance":
          return b.attendancePercentage - a.attendancePercentage;
        case "homework":
          return b.homeworkCompletionPercentage - a.homeworkCompletionPercentage;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [students, searchQuery, filterLevel, filterStatus, sortBy]);

  const handleViewProfile = (studentId: string) => {
    router.push(`/teacher/students/${studentId}`);
  };

  const handleSendMessage = (studentId: string) => {
    toast.info(`Opening message composer for student ID: ${studentId}`);
  };

  const getStatusBadge = (status: Student["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "at-risk":
        return (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            At Risk
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        );
    }
  };

  const getPerformanceBadge = (percentage: number, type: "attendance" | "homework") => {
    const color = percentage >= 80 ? "green" : percentage >= 60 ? "yellow" : "red";
    const icon = type === "attendance" ? <Calendar className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />;
    
    return (
      <div className="flex items-center gap-1">
        <span className={`text-sm font-medium ${
          color === "green" ? "text-green-600" :
          color === "yellow" ? "text-yellow-600" :
          "text-red-600"
        }`}>
          {percentage}%
        </span>
        <div className={`h-2 w-2 rounded-full ${
          color === "green" ? "bg-green-500" :
          color === "yellow" ? "bg-yellow-500" :
          "bg-red-500"
        }`} />
      </div>
    );
  };

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle>Your Students</CardTitle>
            <CardDescription>
              {filteredAndSortedStudents.length} of {students.length} students shown
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-[200px]"
              />
            </div>
            
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {uniqueLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="at-risk">At Risk</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="homework">Homework</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <AnimatePresence mode="wait">
            {filteredAndSortedStudents.length === 0 ? (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 text-muted-foreground"
              >
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No students found matching your filters</p>
              </m.div>
            ) : (
              filteredAndSortedStudents.map((student, index) => (
                <m.div
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-4 rounded-xl border bg-background/50 hover:bg-background/80 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-base">{student.name}</h3>
                        <Badge className={getLevelColor(student.level)} variant="secondary">
                          {student.level}
                        </Badge>
                        {getStatusBadge(student.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Attendance:</span>
                          <div className="mt-1">
                            {getPerformanceBadge(student.attendancePercentage, "attendance")}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">HW Completion:</span>
                          <div className="mt-1">
                            {getPerformanceBadge(student.homeworkCompletionPercentage, "homework")}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Last Attended:</span>
                          <div className="mt-1 text-sm">
                            {student.lastAttendedClass 
                              ? format(student.lastAttendedClass, "MMM dd, yyyy")
                              : "Never"
                            }
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Cohort:</span>
                          <div className="mt-1 text-sm">{student.cohort}</div>
                        </div>
                      </div>

                      {(student.status === "at-risk" || student.status === "inactive") && (
                        <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <p className="text-xs text-orange-700 dark:text-orange-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {student.attendancePercentage < 60 && "Low attendance. "}
                            {student.homeworkCompletionPercentage < 30 && "Missing homework submissions. "}
                            {student.status === "inactive" && "Student has been inactive for extended period."}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProfile(student.id)}
                        className="gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendMessage(student.id)}
                        className="gap-1"
                      >
                        <Send className="h-4 w-4" />
                        Message
                      </Button>
                    </div>
                  </div>
                </m.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}