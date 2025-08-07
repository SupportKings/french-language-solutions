"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingDown, AlertTriangle, BookOpenCheck, CalendarX } from "lucide-react";
import { motion as m } from "framer-motion";
import type { StudentSummary } from "../data/mock-data";

interface StudentsSummaryCardProps {
  summary: StudentSummary;
}

export function StudentsSummaryCard({ summary }: StudentsSummaryCardProps) {
  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Student Overview
          </span>
          {summary.studentsFallingBehind > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {summary.studentsFallingBehind} falling behind
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Quick overview of your students' performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Students</span>
            </div>
            <div className="text-2xl font-bold">{summary.totalAssignedStudents}</div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2">
              <CalendarX className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Attendance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{summary.avgAttendanceRate}%</span>
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  summary.avgAttendanceRate >= 80 ? "bg-green-100 text-green-700" :
                  summary.avgAttendanceRate >= 60 ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}
              >
                {summary.avgAttendanceRate >= 80 ? "Good" :
                 summary.avgAttendanceRate >= 60 ? "Fair" : "Low"}
              </Badge>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Homework</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{summary.avgHomeworkCompletionRate}%</span>
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  summary.avgHomeworkCompletionRate >= 80 ? "bg-green-100 text-green-700" :
                  summary.avgHomeworkCompletionRate >= 60 ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}
              >
                {summary.avgHomeworkCompletionRate >= 80 ? "Good" :
                 summary.avgHomeworkCompletionRate >= 60 ? "Fair" : "Low"}
              </Badge>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Low Attendance</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {summary.studentsUnder60Attendance}
            </div>
            <p className="text-xs text-muted-foreground">Under 60%</p>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">No Homework</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {summary.studentsNotSubmittingHomework}
            </div>
            <p className="text-xs text-muted-foreground">Under 30%</p>
          </m.div>
        </div>
      </CardContent>
    </Card>
  );
}