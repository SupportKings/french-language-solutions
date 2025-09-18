// Airtable Schema Types
// Generated on: 2025-09-15T08:27:26.728Z

// Teachers/Team
export interface AirtableTeachersTeam {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Teacher Full Name"?: any; // formula - Formula: {fldm3r762kStRt2du} & " " & {fldeYvO6qxReRf5dx}
  "First Name"?: string; // singleLineText
  "Last Name"?: string; // singleLineText
  "Team Onboarding Status"?: "-1 - No Longer with FLS" | "0 - New" | "10 - Training in Progress" | "100 - Onboarded"; // singleSelect
  "Roles"?: ("Teacher" | "Evaluator" | "Marketing/Admin" | "Exec")[]; // multipleSelects
  "Group Class Bonus Terms"?: "Per Student Per Hour up to $50/hr" | "Per Hour"; // singleSelect
  "Maximum Students Per In-Person Class"?: number; // number
  "Contract Type"?: "Freelancer" | "Full-Time"; // singleSelect
  "Events"?: string[]; // multipleRecordLinks - Links to table ID: tbldeW8SeBkDIlywc
  "Available for Teach Online Classes"?: "Yes" | "No"; // singleSelect
  "Available for In-Person Classes"?: "Yes" | "No"; // singleSelect
  "Email"?: string; // email
  "Mobile Phone Number"?: string; // phoneNumber
  "Home Phone Number"?: string; // phoneNumber
  "Student Assessments"?: string[]; // multipleRecordLinks - Links to table ID: tbl8qPVvfrZfqFd7d
  "French Programs/Cohorts"?: string; // singleLineText
  "Teacher Payouts"?: string[]; // multipleRecordLinks - Links to table ID: tblUKLQjNAOQdMZI9
  "Teacher Notes"?: string; // multilineText
  "Cohort Weekly Session"?: string[]; // multipleRecordLinks - Links to table ID: tbl42r90BBxZsI1ak
  "Teacher Certifications"?: string[]; // multipleRecordLinks - Links to table ID: tblKiN99Ing14hSaO
  "Teacher Skill"?: "Beginner" | "Medium" | "Expert"; // singleSelect
  "Google Calendar ID"?: string; // singleLineText
  "Calendar Events Test"?: string; // singleLineText
  "Calendar Events Test 2"?: string; // singleLineText
  "Student Assessments 2"?: string[]; // multipleRecordLinks - Links to table ID: tbl8qPVvfrZfqFd7d
  "Maximum Working Hours Per Week"?: number; // number
  "Event Attendees"?: string[]; // multipleRecordLinks - Links to table ID: tblEPlV4hrRut5WCU
  "Maximum Students for Online Group Class"?: number; // number
  "Teacher's Average Workload (28 Days)"?: any; // formula - Formula: {fldMfgoJLlKbmuPfK} / 4
  "Teacher's Total Workload (Next Week)"?: any; // rollup
  "Teacher's Total Workload (28 Days)"?: any; // rollup
  "1-1 Class Requests"?: string[]; // multipleRecordLinks - Links to table ID: tblFOgL0CxG2uXN1m
  "Days Available for Online Classes"?: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday")[]; // multipleSelects
  "Days Available for In-Person Classes"?: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday")[]; // multipleSelects
  "Maximum Working Hours Per Day"?: number; // number
  "Exceed Workload for Next Week"?: any; // formula - Formula: AND(
  {fldcd3N5Y4fmnrOVB},
  {fldKm2tmMjm5Rg2cb} >= {fldcd3N5Y4fmnrOVB}
)

  "Qualified for Under 16"?: "No" | "Yes"; // singleSelect
  "Calendar Events"?: string[]; // multipleRecordLinks - Links to table ID: tblo7z7DbVaOGIEmJ
  "Time Off Requests"?: string[]; // multipleRecordLinks - Links to table ID: tblLfED38zP9kGUfK
  "Time Off Form URL"?: any; // formula - Formula: "https://airtable.com/appNpK5S8d0MnhdVH/pagDHiXxcr85SsL1O/form?prefill_Teacher=" & RECORD_ID()
  "Available for Booking?"?: "Not Available" | "Available"; // singleSelect
  "Record ID"?: any; // formula - Formula: RECORD_ID()
}

// Students/Leads
export interface AirtableStudentsLeads {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Name"?: string; // singleLineText
  "First Name"?: any; // formula - Formula: TRIM(LEFT({fldiplaow1BAXo974}, FIND(" ", {fldiplaow1BAXo974} & " ") - 1))
  "Last Name"?: any; // formula - Formula: TRIM(RIGHT({fldiplaow1BAXo974}, LEN({fldiplaow1BAXo974}) - FIND(" ", {fldiplaow1BAXo974} & " ")))
  "Form Created"?: string; // dateTime
  "Hour of Day"?: any; // formula - Formula: HOUR({fld5GcElxkRh6OvkK})
  "ConvertKit Subscriber ID"?: string; // singleLineText
  "Email"?: string; // email
  "Lead Status"?: "-100 - BLACKLIST/BAN" | "-10 - Archived / Resubmitted Enrollment Form" | "0 - Inquiry Received" | "9 - Disqualified" | "10 - Sent Class Form(s)" | "20 - Completed Basic Profile" | "100 - Chose a Class (Add Enrollment to That Class to Hold)"; // singleSelect
  "Mobile Phone Number"?: string; // phoneNumber
  "City"?: string; // singleLineText
  "Desired Starting Language Level"?: string[]; // multipleRecordLinks - Links to table ID: tblmTTItwW0GACuEo
  "Why do you want to learn french?"?: string; // singleLineText
  "Any other factors?"?: string; // singleLineText
  "Online Classes"?: string; // singleLineText
  "Conversational Classes"?: string; // singleLineText
  "New Beginner Intensive"?: string; // singleSelect
  "In Person Classes"?: string; // singleLineText
  "Availability Times"?: ("All Day" | "Afternoon" | "Morning" | "Evening" | "Morning (9:00 am - 12:00 pm)" | "Evening (5:00 pm - 9:00 pm)" | "Afternoon (12:00 pm - 5:00 pm)" | "Weekdays" | "Weekends")[]; // multipleSelects
  "Availability Additional"?: string; // singleLineText
  "Availability Days"?: ("Weekdays" | "Weekends")[]; // multipleSelects
  "When do you want to start?"?: string; // singleLineText
  "A1 level or above experience"?: string; // singleLineText
  "How did you hear about us?"?: string; // singleLineText
  "First Assessment Status"?: any[]; // multipleLookupValues
  "First Enrollment Status"?: any[]; // multipleLookupValues
  "Most Recent Assessment Level"?: any[]; // multipleLookupValues
  "Student Assessments"?: string[]; // multipleRecordLinks - Links to table ID: tbl8qPVvfrZfqFd7d
  "Most Recent Assesssment Date"?: any[]; // multipleLookupValues
  "Days Since Last Assessment"?: any; // formula - Formula: IF({fldpUlmD6gHcuiY6u},
DATETIME_DIFF(NOW(),{fldpUlmD6gHcuiY6u},'days') & " days ago"
,
"N/A")
  "Number of Outbound Follow Ups"?: any; // count
  "Last Follow Up"?: any[]; // multipleLookupValues
  "Sales CRM Cohort"?: string[]; // multipleRecordLinks - Links to table ID: tbl1nb4UeJeuB3sDN
  "Initial Channel"?: "Quiz" | "Call" | "Message" | "Email" | "Form" | "Paid Assessment"; // singleSelect
  "Student Enrollments"?: string[]; // multipleRecordLinks - Links to table ID: tblxPJbUJ2UqE7sqF
  "Added to Email Newsletter"?: "0 - Not Yet Subscribed/Unknown" | "99 - Unsubscribed" | "100 - Subscribed"; // singleSelect
  "CRM Touchpoints/FollowUps"?: string[]; // multipleRecordLinks - Links to table ID: tblYsUNtdiYXz2XPd
  "Overall Lead Status"?: any; // formula - Formula: SWITCH(1,
1,"New",
1.5,"Lead Active",
2,"Stale - Follow Up",
2.5,"Purchased Assessment",
3,"Assessed",
4,"Enrolled",
5,"Dropped Out"
) - For interface filters
  "Days Since Last FollowUp"?: any; // formula - Formula: DATETIME_DIFF(NOW(),{fldYJsJd9Os0KTe32},'hours')/24
  "Follow Up Status"?: any; // formula - Formula: IF({fldRADgQbOv27MAiV}>14,'Old',IF({fldGxyVSxZykwDBvZ}>=3,"Stale",

IF(
  OR(
    {fldtcidSoeQWvmw1o}>2,
    {fldGxyVSxZykwDBvZ}=0
    ),"Follow Up","OK")))
  "Last Follow Up/Creation"?: any; // formula - Formula: IF({fldezgFm6tsqoDmEk}=BLANK(),{fld5GcElxkRh6OvkK},{fldezgFm6tsqoDmEk})
  "Stripe Customer ID"?: string; // singleLineText
  "Website Quiz Completed Date"?: string; // dateTime
  "Days Since Creation"?: any; // formula - Formula: DATETIME_DIFF(NOW(),{fld5GcElxkRh6OvkK},'days')
  "Record Created"?: string; // createdTime
  "Calculation"?: any; // formula - Formula: IF({fldEKC9ye0205q1vw} = FALSE(),1)
  "Payments from Student"?: string[]; // multipleRecordLinks - Links to table ID: tblhIvhL1eg3edwH1
  "Lead LTV (All Payments)"?: any; // rollup
  "First Payment Date"?: any[]; // multipleLookupValues
  "Sales Velocity (Lead -> Customer Days)"?: any; // formula - Formula: DATETIME_DIFF({fld9lHBIAWqpkJ40T},{fld5GcElxkRh6OvkK},'days')
  "Cohort Record ID"?: any[]; // multipleLookupValues
  "Student Record ID"?: any; // formula - Formula: RECORD_ID()
  "Stripe Profile URL"?: any; // formula - Formula: IF(
  {fldIT818JA6L64uAe},
  "https://dashboard.stripe.com/customers/" & {fldIT818JA6L64uAe},
  BLANK()
)
  "Calendar Events Test"?: string; // singleLineText
  "Stripe Customer Profile"?: { label: string; url: string }; // button
  "Discovery Channel"?: "Facebook" | "Instagram" | "Google" | "Youtube" | "Referral" | "Kijiji" | "Meetup" | "Other"; // singleSelect
  "Other Discovery Channel"?: string; // singleLineText
  "Purpose to Learn"?: "Immigration (TEF, TCF, TEFAQ)" | "Second Language Exam (for Canadian work purposes)" | "Work" | "Personal Goals" | "Travel" | "School (for kids)" | "Other" | "School"; // singleSelect
  "Other Purpose to Learn"?: string; // singleLineText
  "Student's Subjective Deadline"?: string; // date
  "Student's Beginning Level (from Enrollment Form)"?: "Complete Beginner (A0)" | "I already know some French (A1 or above)"; // singleSelect
  "Respondent ID"?: string; // singleLineText
  "Submission ID"?: string; // singleLineText
  "1-1 Class Requests"?: string[]; // multipleRecordLinks - Links to table ID: tblFOgL0CxG2uXN1m
  "Lead Created Date"?: any; // formula - Formula: SWITCH(
  {fldE8jKYLEyDkSBMt},
  "Form", {fld5GcElxkRh6OvkK},
  "Quiz", {fld5cwAIB1qhtNDsW},
  "Call",{fldAgDs5U41Acauwc},
  {fldgU1iNy8o55Jknz}
)
  "Day of Week"?: any; // formula - Formula: DATETIME_FORMAT({fld5GcElxkRh6OvkK},"d-dddd")
  "Month"?: any; // formula - Formula: DATETIME_FORMAT({fld5GcElxkRh6OvkK},"M-MMMM")
  "Year"?: any; // formula - Formula: DATETIME_FORMAT({fld5GcElxkRh6OvkK},"YYYY")
  "Event Attendees"?: string[]; // multipleRecordLinks - Links to table ID: tblEPlV4hrRut5WCU
  "OpenPhone Contact ID"?: string; // singleLineText
  "Formatted Phone Number"?: any; // formula - Formula: SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE({flddOcwSbeFL5DIGz}, "(", ""), ")", ""), "-", ""), " ", "")
  "test"?: any; // formula - Formula: FIND("29999716",{fldcHwgmDAlN6Ix37})
  "Created By"?: { id: string; email: string; name: string }; // createdBy
  "First Contact"?: any[]; // multipleLookupValues
  "Number of Classes Enrolled"?: any; // count
  "Default Communication Channel"?: "SMS & Email" | "SMS" | "Email"; // singleSelect
  "Automated Follow Ups"?: string[]; // multipleRecordLinks - Links to table ID: tbluQwBKY1hpsOvaE
  "Automated Follow Up Status"?: any[]; // multipleLookupValues
  "Automated Follow Up Status Digit"?: any[]; // multipleLookupValues
  "OpenPhone Profile"?: { label: string; url: string }; // button
  "Age Group"?: "16 or older" | "Under 16"; // singleSelect
  "Follow Up Sequence (from Automated Follow Ups)"?: any[]; // multipleLookupValues
}

// Sales Cohort
export interface AirtableSalesCohort {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Name"?: string; // singleLineText
  "Students/Leads"?: string[]; // multipleRecordLinks - Links to table ID: tblDuD2OQoYgLA2r8
  "Cohort Start Date"?: string; // date
  "Number of Leads"?: any; // count
  "Number of Customers (At Least One Payment)"?: any; // count
  "Total Cash Collected"?: any; // rollup
  "Average Lead Value"?: any; // formula - Formula: IF({fldmv7ILXyoOPn3G7}>0,{fldvO1fmCvU6f3fox}/{fldmv7ILXyoOPn3G7},0)
  "Average Student Value"?: any; // formula - Formula: IF({fldm25U1NCf5Xm1Um}>0,{fldvO1fmCvU6f3fox}/{fldm25U1NCf5Xm1Um},0)
  "Conversion Rate (Leads/Customers)"?: any; // formula - Formula: {fldm25U1NCf5Xm1Um}/{fldmv7ILXyoOPn3G7}
  "Average Sales Velocity (Days)"?: any; // rollup
}

// CRM Touchpoints/Follow Ups
export interface AirtableCRMTouchpointsFollowUps {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Follow Up ID"?: any; // formula - Formula: DATETIME_FORMAT({fldEI7t0R0VrFoMQ5},"D MMM") & ' - ' & {fldo3OJxZCf5NHi62}
  "Leads"?: string[]; // multipleRecordLinks - Links to table ID: tblDuD2OQoYgLA2r8
  "Automated Follow Up Status Digit (from Leads)"?: any[]; // multipleLookupValues
  "Date"?: string; // dateTime
  "Note"?: string; // singleLineText
  "Channel"?: "Email" | "Call" | "SMS" | "WhatsApp"; // singleSelect
  "Direction"?: "From Lead" | "To Lead"; // singleSelect
  "Call Status"?: "No Answer" | "Completed"; // singleSelect
  "Event Type"?: "Outbound" | "Inbound"; // singleSelect
  "Message from Lead"?: string; // multilineText
  "Message to Lead"?: string; // multilineText
  "Follow Up Status Digit (from Leads)"?: any[]; // multipleLookupValues
  "Follow Up - Process Status (from Leads)"?: any[]; // multipleLookupValues
}

// Automated Follow Ups
export interface AirtableAutomatedFollowUps {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Name"?: any; // formula - Formula: {fldSQJ1KrQWtLW3jJ} & " - " & {flduUsa5gvUi8qGdH}
  "Student"?: string[]; // multipleRecordLinks - Links to table ID: tblDuD2OQoYgLA2r8
  "Mobile Phone Number (from Student)"?: any[]; // multipleLookupValues
  "Student Record ID"?: any[]; // multipleLookupValues
  "Follow Up Sequence"?: string[]; // multipleRecordLinks - Links to table ID: tbl1mK5HDNXlnbVlx
  "Time Delay for First Follow Up (from Follow Up Sequence)"?: any[]; // multipleLookupValues
  "Name (from Student)"?: any[]; // multipleLookupValues
  "Status"?: "-2 - Answer Received" | "-1 - Disabled Manually" | "00 - Activated" | "50 - Follow Up Ongoing" | "100 - Completed"; // singleSelect
  "Next Step"?: any[]; // multipleLookupValues
  "Last Name (from Student)"?: any[]; // multipleLookupValues
  "First Name (from Student)"?: any[]; // multipleLookupValues
  "Next Message"?: any; // formula - Formula: REGEX_REPLACE(REGEX_REPLACE(
  REGEX_REPLACE({fldhIGBwn4atnc1Q4} & "", "{First Name}", {fld9ZFtlmlvfSJrJe} & "")
  ,"{Last Name}", {fld8433uIUPVNlV8G} & ""), "{Full Name}", {fld93D1npu1k5oZx4} & "")
  "Subject"?: any; // formula - Formula: REGEX_REPLACE(REGEX_REPLACE(
  REGEX_REPLACE({fldXhHQ2YnttRkAy0} & "", "{First Name}", {fld9ZFtlmlvfSJrJe} & "")
  ,"{Last Name}", {fld8433uIUPVNlV8G} & ""), "{Full Name}", {fld93D1npu1k5oZx4} & "")
  "Number of Active Messages (from Follow Up Sequence)"?: any[]; // multipleLookupValues
  "Subject Template"?: any[]; // multipleLookupValues
  "Next Message Record"?: string[]; // multipleRecordLinks - Links to table ID: tbl6qmw0Mk4i80Qf1
  "Time Delay (Hours) (from Next Message Record)"?: any[]; // multipleLookupValues
  "Next Message Template"?: any[]; // multipleLookupValues
  "First Message Template (from Follow Up Sequence)"?: any[]; // multipleLookupValues
  "Activated Time"?: string; // createdTime
  "Status Digit"?: any; // formula - Formula: REGEX_EXTRACT({fldOTChFQ5wDd2STk},"[\\d-]+")+0
  "Last Follow Up Time"?: string; // dateTime
  "Send Next Message Trigger"?: any; // formula - Formula: IF(
  OR({fldkCQFVs2DRPMdVS} < 0, {fldkCQFVs2DRPMdVS} = 100),
  FALSE(),
  IF(
    {fldtYLClVxUQNTsZN} = 1,
    IS_AFTER(
      NOW(),
      SWITCH(
        {fldhIU8R04XsN8ZJA},"24 Hours",
      DATEADD({fldM8LJdbgoWLE1kV}, 1, "day"),
      "30 Minutes", DATEADD({fldM8LJdbgoWLE1kV}, 30, "minute"),
      "10 Minutes", DATEADD({fldM8LJdbgoWLE1kV}, 10, "minute")
      )
    ),
    IS_AFTER(
      NOW(),
      DATEADD({fldwsRnMKQJYkBOSy}, {fld16gYKbTGqhwaWJ} + 0, "hour")
    )
  )
)

  "Created at"?: string; // createdTime
}

// Follow Up Sequences - Templates
export interface AirtableFollowUpSequencesTemplates {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Name"?: string; // singleLineText
  "Automated Follow Ups"?: string[]; // multipleRecordLinks - Links to table ID: tbluQwBKY1hpsOvaE
  "Follow Up Sequence Messages"?: string[]; // multipleRecordLinks - Links to table ID: tbl6qmw0Mk4i80Qf1
  "Number of Active Messages"?: any; // count
  "First Message Template"?: any[]; // multipleLookupValues
  "Subject"?: string; // singleLineText
  "Record ID"?: any; // formula - Formula: RECORD_ID()
  "Time Delay for First Follow Up"?: "10 Minutes" | "30 Minutes" | "24 Hours"; // singleSelect
}

// Follow Up Sequence - Template Messages
export interface AirtableFollowUpSequenceTemplateMessages {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Message ID"?: any; // formula - Formula: {flduzPbXKkQV3jeIJ} &  " - Message " & {fldzVdBH63IveJRvB}
  "Message"?: string; // multilineText
  "Step Index"?: number; // number
  "Status"?: "Active" | "Disabled"; // singleSelect
  "Message Validity"?: any; // formula - Formula: IF(
  OR(
    FIND("{First Name}", {fldJiTEPcvAcOW4y0}),
    FIND("{Last Name}", {fldJiTEPcvAcOW4y0}),
    FIND("{Full Name}", {fldJiTEPcvAcOW4y0})
  ),
  IF(
    REGEX_MATCH({fldJiTEPcvAcOW4y0}, "\\{[^}]+\\}"),
    IF(
      REGEX_MATCH({fldJiTEPcvAcOW4y0}, "^([^{]*({First Name}|{Last Name}|{Full Name}))*[^{]*$"),
      "Valid",
      "Invalid"
    ),
    "Valid"
  ),
  IF(
    REGEX_MATCH({fldJiTEPcvAcOW4y0}, "\\{[^}]+\\}"),
    "Invalid",
    "Valid"
  )
)
  "Follow Up Sequence"?: string[]; // multipleRecordLinks - Links to table ID: tbl1mK5HDNXlnbVlx
  "Scheduled Time"?: "1 Day After Last Message" | "2 Days After Last Message" | "3 Days After Last Message" | "7 Days After Last Message"; // singleSelect
  "Time Delay (Hours)"?: any; // formula - Formula: (REGEX_EXTRACT({fldsEDXr1KuaaxAEu}, "\\d+") + 0) * 24
  "Automated Follow Ups"?: string[]; // multipleRecordLinks - Links to table ID: tbluQwBKY1hpsOvaE
  "Record ID (from Follow Up Sequence)"?: any[]; // multipleLookupValues
}

// French Programs/Cohorts
export interface AirtableFrenchProgramsCohorts {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Program Name ID"?: any; // formula - Formula: "["&{fldmZeoCIkVC1VmxI}&"] " & {fldMkFohga92wq6fp} & " " & {fldZt6G8GepNK77IW} & " - " & {fldJDtMq8RjAZtedy}
  "created by"?: { id: string; email: string; name: string }; // createdBy
  "created"?: string; // createdTime
  "Product"?: string[]; // multipleRecordLinks - Links to table ID: tblpmFWT5CzTloQam
  "Max Students Per Class - from Product"?: any[]; // multipleLookupValues
  "Max Students - Restricted by Room (Manual)"?: "10 (Large Room)" | "6 (Medium +)" | "5 (Medium Room)" | "1 (1:1 Class)"; // singleSelect
  "Current Level"?: "A0" | "A1.1" | "A1.2" | "A1.3" | "A1.4" | "A1.5" | "A1.6" | "A1.7" | "A1.8" | "A1.9" | "A1.10" | "A2.1" | "A2.2" | "A2.3" | "A2.4" | "A2.5" | "A2.6" | "A2.7" | "A2.8" | "A2.9" | "A2.10" | "A2.11" | "A2.12" | "B1.1" | "B1.2" | "B1.3" | "B1.4" | "B1.5" | "B1.6" | "B1.7" | "B1.8" | "B1.9" | "B1.10" | "B1.11" | "B1.12"; // singleSelect
  "Program ID"?: number; // autoNumber
  "Location"?: any[]; // multipleLookupValues
  "Format"?: any[]; // multipleLookupValues
  "Student Enrollments"?: string[]; // multipleRecordLinks - Links to table ID: tblxPJbUJ2UqE7sqF
  "Email (from Student Enrollments)"?: any[]; // multipleLookupValues
  "Current Student Levels"?: any[]; // multipleLookupValues
  "Max Students"?: any; // formula - Formula: MIN(
  {fldlUhfIf5KsnWrOu},
  {fldQBSMsQa3Lh5PYc},
  IF({fldgFul0MNI7vKODQ}>0,{fldgFul0MNI7vKODQ},999))
  "Total Students - Paid"?: any; // count
  "Max - from Teacher - for In-Person Group Class"?: any; // rollup
  "Percent Full"?: any; // formula - Formula: IF(
  {fldLJHeE3pYavXsKd} > 0,
  {fldrug7iKDGXk1Tot}/{fldLJHeE3pYavXsKd},
  0
)
  "Open Places"?: any; // formula - Formula: IF(
  OR(
  {fldSIKWCuTVO6P0gU} = 0,
  {fld83R25ytMksCWYL} = BLANK()
  ),
  {fldLJHeE3pYavXsKd} - {fldrug7iKDGXk1Tot},
  0
)
  "Google Drive Folder ID"?: string; // singleLineText
  "Weekly Schedule"?: string[]; // multipleRecordLinks - Links to table ID: tbl42r90BBxZsI1ak
  "Day of Week - Abbreviation (from Weekly Schedule)"?: any[]; // multipleLookupValues
  "Teachers"?: any; // rollup
  "Events/Class Sessions"?: string[]; // multipleRecordLinks - Links to table ID: tbldeW8SeBkDIlywc
  "Starting Level"?: string[]; // multipleRecordLinks - Links to table ID: tblmTTItwW0GACuEo
  "Start Date"?: string; // date
  "Days Since First Class"?: any; // formula - Formula: IF(
{fldZo0V7yQFuYoa9l},
DATETIME_DIFF(TODAY(),{fldZo0V7yQFuYoa9l},"days"),
0
)
  "Enrollment Status"?: any; // formula - Formula: IF(
  {fldSIKWCuTVO6P0gU} = 0,
  IF(
    {fldZo0V7yQFuYoa9l}=BLANK(),"Configuration",
    IF({fldmDFRiA6gGMoPZs}>=1,"Full",
    IF(
      {fldWAH0XfvoZfKZrB}<14,
      "Open",
      "Open - After Assessment")
    )
  ),
  "Enrollment Closed"
)
  "Enrollment Message"?: any; // formula - Formula: IF({fldZo0V7yQFuYoa9l}=BLANK(),"Configuration",
IF({fldWAH0XfvoZfKZrB}<0,"Starts in " & ABS({fldWAH0XfvoZfKZrB}) & " Days","Started " & ABS({fldWAH0XfvoZfKZrB}) & " Days Ago"))
  "Total Students Hold Expired"?: any; // count
  "Total Spots Held"?: any; // count
  "Number of Students Enrolled"?: any; // count
  "Status Label"?: any; // formula - Formula: IF(
  {fldV2r0fdjnfhn0V6} > 0,
  "🔴 " & {fldV2r0fdjnfhn0V6} & " hold(s) have expired.",
  IF(
    {fldfnEAMGTUX8wz7s} > 0,
    "🟢 " & {fldfnEAMGTUX8wz7s} & "/" & {fldLJHeE3pYavXsKd} & " enrolled, " & {fldfg12G8nG6Ex0zT} & " spot(s) on hold.",
    IF(
      {fldfg12G8nG6Ex0zT} > 0,
      "🟡 " & {fldfg12G8nG6Ex0zT} & " spot(s) currently on hold.",
      "⚪️ No students enrolled or on hold."
    )
  )
)

  "Day of Week"?: any[]; // multipleLookupValues
  "Upcoming Session Date"?: any[]; // multipleLookupValues
  "Google Drive ID"?: string; // singleLineText
  "Teacher Emails"?: any[]; // multipleLookupValues
  "Record ID"?: any; // formula - Formula: RECORD_ID()
  "Cohort UI Label"?: any; // formula - Formula: {fldMkFohga92wq6fp} & ": " & {fldlbOfNya0eLAvfd}
  "A0 Open for Enrollment"?: any; // formula - Formula: AND(
  OR(
    {fldZo0V7yQFuYoa9l} = BLANK(),
    {fldWAH0XfvoZfKZrB} <= 14
  ),
  {fldmDFRiA6gGMoPZs} < 1,
  {fldENPHYI5OCru18L} > 0,
  {fldxRhQkm0ipNDLzO} = "A0",
  {fldZt6G8GepNK77IW} = "Group"
) 
  "Start Time (from Weekly Schedule)"?: any[]; // multipleLookupValues
  "Day of Week (from Weekly Schedule)"?: any[]; // multipleLookupValues
  "Signup Link (for Self-Checkout) (from Product)"?: any[]; // multipleLookupValues
  "Notes"?: string; // multilineText
  "Finalize & Create Google Calendar Events"?: boolean; // checkbox
  "Max - from Room"?: any; // formula - Formula: REGEX_EXTRACT({fldQydAnvdbpRkSpJ},"[\\d]+")+0
  "Max - from Teacher - for Online Group Class"?: any; // rollup
  "Max - From Teacher"?: any; // formula - Formula: IF({fldMkFohga92wq6fp}="Online",{fldRk6SLLlkzQ6SWC},{fldBJNdiLrCOBf44G})
  "Location (from Product)"?: any[]; // multipleLookupValues
  "Current Level Last Updated at"?: string; // lastModifiedTime
  "Start Date (from Events)"?: any[]; // multipleLookupValues
  "Cohort Status"?: "0 - Open for Enrollment" | "50 - Closed for Enrollment" | "100 - Class Ended"; // singleSelect
  "Cohort Status Digit"?: any; // formula - Formula: IF({fld83R25ytMksCWYL},REGEX_EXTRACT({fld83R25ytMksCWYL},"[\\d-]+")+0)
  "Checks"?: any; // formula - Formula: IF(
  {fldZo0V7yQFuYoa9l} = BLANK(),
  "🔴 Start Date is Missing.",
  IF(
    OR(
      {fldJDtMq8RjAZtedy}=BLANK(),
      {fldgucLx4iQJr66zh} != {fldeNODrPh3Fjsx97}
    ),
    "🔴 Weekly Session(s) not Configured.",
    "✅ Weekly Session(s) Configured."
  )
)

  "Number of Weekly Sessions"?: any; // count
  "Number of Configured Weekly Sessions"?: any; // count
  "Number of Weekly Sessions with Events"?: any; // count
  "Private Class Payment Status"?: any; // formula - Formula: IF(
  {fldZt6G8GepNK77IW} = "Private",
  IF(
    {fldrug7iKDGXk1Tot} > 0,
    "Paid",
    "Unpaid"
  ),
  "Not Private"
)
  "Created by Automation?"?: boolean; // checkbox
}

// Student Enrollments
export interface AirtableStudentEnrollments {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Enrollment ID"?: any; // formula - Formula: {fld8Q2y2AyETWjyGx} & " - " & {fldU3PXumZeGy8CDD}
  "Student"?: string[]; // multipleRecordLinks - Links to table ID: tblDuD2OQoYgLA2r8
  "Enrollment Status"?: "-2 - Declined Contract" | "-1 - Dropped Out" | "0 - Interested" | "10 - Enrollment Form for Beginners Filled" | "19 - Contract Abandoned" | "20 - Contract Signed" | "49 - Payment Abandoned" | "100 - Paid" | "200 - Welcome Package Sent"; // singleSelect
  "Email (from Student)"?: any[]; // multipleLookupValues
  "Most Recent Assessment Level (from Student)"?: any[]; // multipleLookupValues
  "French Program/Cohort"?: string[]; // multipleRecordLinks - Links to table ID: tblQYVsRWi8jzt4jh
  "Cohort Record ID"?: any[]; // multipleLookupValues
  "Stripe Signup Link"?: any[]; // multipleLookupValues
  "Status"?: any; // formula - Formula: IF(
  {fld3ClxKjP2PVHxPK} >= 100,
  "Enrolled",
  IF(
    AND(
      {fld3ClxKjP2PVHxPK} >= 0,
      IS_BEFORE(NOW(), {fldE4UucyTg7y1LEB})
    ),
    "Held",
    IF(
      {fld3ClxKjP2PVHxPK} >= 0,
      "Hold Expired",
      "Not Enrolled"
    )
  )
)

  "Created"?: string; // createdTime
  "Hold Length"?: "12h" | "24h" | "48h" | "72h"; // singleSelect
  "Hold Spot Until"?: string; // dateTime
  "Enrollment Status Digit"?: any; // formula - Formula: REGEX_EXTRACT({fldnEznTbY6mZXWfO},"[\\d-]+")+0
  "Stripe Payment URL"?: any; // formula - Formula: {fldDhaGuSRTiIbE6a} & "?client_reference_id=" & RECORD_ID() & "%20" & {fldcQoPzm3bP8Lg4q}
  "Student Record ID"?: any[]; // multipleLookupValues
  "Attendance Records"?: string[]; // multipleRecordLinks - Links to table ID: tblGuGvIJcNmkC4CW
  "Days Since Last Assessment"?: any[]; // multipleLookupValues
  "Contract/Payment Abandoned"?: any; // formula - Formula: IF(
  AND(
  OR(
    {fld3ClxKjP2PVHxPK} = 10,
    {fld3ClxKjP2PVHxPK} = 20
  ),
  DATETIME_DIFF(NOW(),{fld9vNQKKwDqaW5gZ},"minutes") > 20
  ),
  TRUE(),
  FALSE()
)
  "Status Last Updated at"?: string; // lastModifiedTime
  "Day of Week (from Weekly Schedule) (from French Program/Cohort)"?: any[]; // multipleLookupValues
  "Starting Level (from French Program/Cohort)"?: any[]; // multipleLookupValues
  "Teachers (from French Program/Cohort)"?: any[]; // multipleLookupValues
  "Product (from French Program/Cohort)"?: any[]; // multipleLookupValues
  "Format (from French Program/Cohort)"?: any[]; // multipleLookupValues
  "Enrollment Checklist"?: string; // richText
  "Template Enrollment Checklist"?: any; // formula - Formula: "[ ] Class link has been sent" & 
"\n[ ] Future class title is correct" & 
"\n[ ] Tags updated in Kit – remove any tags containing \"group\" and add \"FLS Team NEW\"" & 
"\n[ ] Contract has been signed" & 
"\n[ ] Welcome email has been sent" & 
"\n[ ] Added to the WhatsApp group" & 
"\n[ ] Rules shared in WhatsApp" & 
"\n[ ] Teacher has been notified via email" & 
"\n[ ] Google Drive folder is set up" & 
"\n[ ] Payment has been adjusted"
  "Enrollment Progress"?: any; // formula - Formula: IF({fldCqZUPPg8GxW6g5}=BLANK(),0,IF({fldCqZUPPg8GxW6g5}, (LEN({fldCqZUPPg8GxW6g5}) - LEN(SUBSTITUTE({fldCqZUPPg8GxW6g5}, "[x", "["))) / (LEN({fldCqZUPPg8GxW6g5}) - LEN(SUBSTITUTE({fldCqZUPPg8GxW6g5}, "[", "")))))

}

// Cohort Weekly Session
export interface AirtableCohortWeeklySession {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Weekly Session ID"?: any; // formula - Formula: {fldv7KoDFj6HjBtue} & " " & {fldhJn97sHBNIuH5z} & " " & {fld1Wl6PZF8Nx77MB}
  "Cohort"?: string[]; // multipleRecordLinks - Links to table ID: tblQYVsRWi8jzt4jh
  "Finalize & Create Google Calendar Events (from Cohort)"?: any[]; // multipleLookupValues
  "Next Event Start Time"?: any; // formula - Formula: DATEADD(SET_TIMEZONE(
  DATEADD(
    DATEADD(
      SET_TIMEZONE(TODAY(), 'America/Toronto'),
    MOD(
  (SWITCH(
    {fldhJn97sHBNIuH5z},
    "Sunday", 0,
    "Monday", 1,
    "Tuesday", 2,
    "Wednesday", 3,
    "Thursday", 4,
    "Friday", 5,
    "Saturday", 6
  ) - WEEKDAY(SET_TIMEZONE(TODAY(), 'America/Toronto')) + 6),
  7
),
      'days'
    ),
    {fldXvV68cKuKeiR7S},
    'seconds'
  ),
  'America/Toronto'
),4,"hour")

  "Next Event End Time"?: any; // formula - Formula: DATEADD(DATEADD({fldNlV3IamHxFBIq8},{fldPQQW58VXYqrtTs},"hour"),{fld9ODXd5dVHf0pz8},"minute")
  "Create Folders at"?: any; // formula - Formula: DATEADD({fldNlV3IamHxFBIq8},-24,"hour")
  "Google Drive ID (from Cohort)"?: any[]; // multipleLookupValues
  "Google Calendar Event ID"?: string; // singleLineText
  "Created at"?: string; // createdTime
  "Product (from Cohort)"?: any[]; // multipleLookupValues
  "Day of Week"?: string[]; // multipleRecordLinks - Links to table ID: tblajnrNF2TYVuJd2
  "Day of Week - Abbreviation"?: any; // formula - Formula: SWITCH(
  {fldhJn97sHBNIuH5z},
  "Sunday", "SU",
  "Monday", "MO",
  "Tuesday", "TU",
  "Wednesday", "WE",
  "Thursday", "TH",
  "Friday", "FR",
  "Saturday", "SA"
)

  "Start Time (hh:mm)"?: number; // duration
  "Duration (h:mm)"?: "0:45" | "1:00" | "1:30" | "2:00"; // singleSelect
  "End Time"?: any; // formula - Formula: DATETIME_FORMAT(
  DATEADD(
    DATEADD(
      DATETIME_PARSE({fldv7KoDFj6HjBtue}, "h:mm A"),
      VALUE(REGEX_EXTRACT({fldawoJEBBTJQmwrG}, "^(\\d+):")),
      "hours"
    ),
    VALUE(REGEX_EXTRACT({fldawoJEBBTJQmwrG}, ":(\\d+)$")),
    "minutes"
  ),
  "HH:mm"
)

  "Start Time (Parsed to Date)"?: any; // formula - Formula: DATETIME_FORMAT(
  DATEADD(
    DATETIME_PARSE("00:00", "HH:mm"),
    {fldXvV68cKuKeiR7S},
    'seconds'
  ),
  'HH:mm'
)

  "Teacher"?: string[]; // multipleRecordLinks - Links to table ID: tblVkXhmy8qX3FHm4
  "Google Calendar ID (from Teacher)"?: any[]; // multipleLookupValues
  "Email (from Teacher)"?: any[]; // multipleLookupValues
  "Maximum Students Per In-Person Class (from Teacher)"?: any[]; // multipleLookupValues
  "Start"?: any; // formula - Formula: DATETIME_FORMAT(SET_TIMEZONE(DATEADD('1970-01-01', {fldXvV68cKuKeiR7S}, 'seconds'), 'UTC'), 'h:mm a')
  "Duration (Hour)"?: any; // formula - Formula: VALUE(REGEX_EXTRACT({fldawoJEBBTJQmwrG}, "^(\\d+):"))

  "Duration (Minutes)"?: any; // formula - Formula: VALUE(REGEX_EXTRACT({fldawoJEBBTJQmwrG}, ":(\\d+)$"))

  "Event Summary"?: any; // formula - Formula: {fldARPgDDMsks3UOh} & ": " &
{fldhJn97sHBNIuH5z} & " / " &
{fld1Wl6PZF8Nx77MB}
  "New Folder Name"?: any; // formula - Formula: "[" & DATETIME_FORMAT({fldNlV3IamHxFBIq8},"DD MMM, YYYY") & "] " &
{fldhJn97sHBNIuH5z} & " / " &
{fld1Wl6PZF8Nx77MB}
  "Trigger to Generate Folder"?: any; // formula - Formula: AND(
  IS_SAME(TODAY(),{fld6Vwvk2Phx5Q5n4}),
  {fldkOQlZgi00pjBQq} != BLANK(),
  {fldOvYkr0ZPxeXmxc} = TRUE()
)
  "Day of Week (String)"?: any; // formula - Formula: {fldhJn97sHBNIuH5z} & ""
  "Duration String"?: any; // formula - Formula: TRIM(
IF({fldPQQW58VXYqrtTs} > 0,
IF(
{fld9ODXd5dVHf0pz8} > 0,
{fldPQQW58VXYqrtTs} & "h",
{fldPQQW58VXYqrtTs} & IF({fldPQQW58VXYqrtTs} = 1," hour"," hours")
)
) 

& " " &

IF({fld9ODXd5dVHf0pz8} > 0,
{fld9ODXd5dVHf0pz8} & "min")
)
  "Start Time (Parsed to Date) copy"?: any; // formula - Formula: DATETIME_FORMAT(
  DATEADD(
    DATETIME_PARSE("00:00", "HH:mm"),
    {fldXvV68cKuKeiR7S},
    'seconds'
  ),
  'HH:mm'
)

  "Cohort Record ID"?: any[]; // multipleLookupValues
  "Maximum Students Per Online Group Class (from Teacher)"?: any[]; // multipleLookupValues
  "Start Date (from Cohort)"?: any[]; // multipleLookupValues
  "First Event Start Time"?: any; // formula - Formula: DATEADD(
  SET_TIMEZONE(
    DATEADD(
      DATEADD(
        SET_TIMEZONE({fld2KBG3xZUgk1IFx}, 'America/Toronto'),
        MOD(
          6 + SWITCH(
            {fldhJn97sHBNIuH5z},
            "Sunday", 0,
            "Monday", 1,
            "Tuesday", 2,
            "Wednesday", 3,
            "Thursday", 4,
            "Friday", 5,
            "Saturday", 6
          ) - WEEKDAY(SET_TIMEZONE({fld2KBG3xZUgk1IFx}, 'America/Toronto'))
        , 7),
        'days'
      ),
      {fldXvV68cKuKeiR7S},
      'seconds'
    ),
    'America/Toronto'
  ),
  4,
  'hour'
)
  "First Event End Time"?: any; // formula - Formula: DATEADD(DATEADD({fldUbITzNKprPG6gZ},{fldPQQW58VXYqrtTs},"hour"),{fld9ODXd5dVHf0pz8},"minute")
}

// Events/Classes
export interface AirtableEventsClasses {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Event ID"?: any; // formula - Formula: DATETIME_FORMAT({fldNpKWyTuGM9DrMt},"DD-MM-YYYY h:mm a","America/New_York") & " - " & {fldoLFhLtfiq9x1W5}
  "Type"?: "Internal Meeting" | "Class" | "Project" | "Student Meetup"; // singleSelect
  "Google Drive"?: { label: string; url: string }; // button
  "Start Date Time"?: string; // dateTime
  "End Date"?: string; // dateTime
  "Duration(h)"?: any; // formula - Formula: DATETIME_DIFF({fldhJWtKriWifr7uq},{fldNpKWyTuGM9DrMt},'minutes')/60
  "Student Cohort"?: string[]; // multipleRecordLinks - Links to table ID: tblQYVsRWi8jzt4jh
  "Record ID (from Student Cohort)"?: any[]; // multipleLookupValues
  "Default Teacher (from Student Cohort)"?: any[]; // multipleLookupValues
  "Team Members"?: string[]; // multipleRecordLinks - Links to table ID: tblVkXhmy8qX3FHm4
  "Google Calendar Event ID"?: string; // singleLineText
  "Room"?: string; // singleLineText
  "Online Access Link"?: string; // url
  "Attendance Records"?: string[]; // multipleRecordLinks - Links to table ID: tblGuGvIJcNmkC4CW
  "Number of Students Attended"?: any; // count
  "Google Folder ID"?: string; // singleLineText
}

// Calendar Events
export interface AirtableCalendarEvents {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Name"?: any; // formula - Formula: {fldQldZHyCssg6lDE} & " / [" & {fldu9S4YE9mHSDnPR} & "] - " & DATETIME_FORMAT({fld51vIJGdkNsDRgz}, "MMMM DD, YYYY")
  "Teacher(s)"?: string[]; // multipleRecordLinks - Links to table ID: tblVkXhmy8qX3FHm4
  "Event is Active"?: any; // formula - Formula: DATETIME_DIFF(TODAY(),{fldpglYFdvSgYNcnR},"days") < 2
  "Last Active at"?: string; // dateTime
  "End Time"?: string; // dateTime
  "End Time (Minutes)"?: any; // formula - Formula: IF(
HOUR({fldy5QhU4qOfPsBax})  * 60 + MINUTE({fldy5QhU4qOfPsBax})<= {fldcECmEYZx6twOwf},
1440 + (HOUR({fldy5QhU4qOfPsBax})  * 60 + MINUTE({fldy5QhU4qOfPsBax})),
HOUR({fldy5QhU4qOfPsBax})  * 60 + MINUTE({fldy5QhU4qOfPsBax})
)
  "Recurrence Status"?: any; // formula - Formula: IF(
{fldt7dD4lQeqfJPMj},
IF(
    {fldt7dD4lQeqfJPMj} = "Not Recurring",
    "Not Recurring",
    IF(
      AND(
        {fldt7dD4lQeqfJPMj} = "Active",
        {fldpTebrsYTth0n8i},
        IS_BEFORE({fldpTebrsYTth0n8i}, NOW())
      ),
      "Past Event",
      "Active"
    )
),
IF(
  {fldjlcXcuanXh97Wp} = BLANK(),
  "Not Recurring"
)
& 
IF(
  AND(
    NOT({fldjlcXcuanXh97Wp} = BLANK()),
    {fld4G9Su5xuZwPY5B} = BLANK()
  ),
  "Active"
) 
&
IF(    
NOT({fld4G9Su5xuZwPY5B} = BLANK()),
IF(
  AND(
    {fldjlcXcuanXh97Wp},
    IS_BEFORE(NOW(),{fld4G9Su5xuZwPY5B})
  ),
  "Active",
  "Past Event"
)
)
)

  "Event ID"?: string; // singleLineText
  "Summary"?: string; // singleLineText
  "Event Attendees"?: string[]; // multipleRecordLinks - Links to table ID: tblEPlV4hrRut5WCU
  "Type (from Event Attendees)"?: any[]; // multipleLookupValues
  "Event Type"?: any; // formula - Formula: IF(
  {fldBwsc87flU1YVgE},
  {fldBwsc87flU1YVgE},
  IF(
  OR(
    FIND("dispo",LOWER({fldQldZHyCssg6lDE})),
    FIND("availab",LOWER({fldQldZHyCssg6lDE}))
  ),
  "Available",
IF(
  OR(
    FIND("pause",LOWER({fldQldZHyCssg6lDE})),
    {fld7u5qttEF6y7ex3} = "outOfOffice"
  ),
  "Pause",
IF(
  OR(
    FIND("off",LOWER({fldQldZHyCssg6lDE})),
    FIND("pause",LOWER({fldQldZHyCssg6lDE})),
    {fld7u5qttEF6y7ex3} = "outOfOffice"
  ),
  "Out of Office",
  IF(
    AND({fldO429A17cNAuF9G} > 1,
    {fldMQ5Ix7vZpsUr5C} = 0),
    "Internal Event"
  ) &
  IF(
    ({fldMQ5Ix7vZpsUr5C} > 0),
    "Class"
  ) &
  IF(
    AND({fldO429A17cNAuF9G} = 1,
    {fldMQ5Ix7vZpsUr5C} = 0),
    "Personal Event (Type Unknown)"
  )
)
)
))
  "Start Time (Minutes)"?: any; // formula - Formula: HOUR({fld51vIJGdkNsDRgz})  * 60 +
MINUTE({fld51vIJGdkNsDRgz}) *  1
  "Duration (with Hours)"?: any; // formula - Formula: {fldAR0anVNLoljlQQ}/60
  "Duration (Last 28 Days)"?: any; // formula - Formula: IF(
  {fldGKPGNleR3Wxk0m} = "Not Recurring",
  {fldAR0anVNLoljlQQ}/60,
  {fldAR0anVNLoljlQQ}/60 * {fld9D4b7y6lEZ98sH}
)
  "t1"?: any; // formula - Formula: IF(    ISERROR({fld4G9Su5xuZwPY5B}) = 0,
IF(
  AND(
    {fldjlcXcuanXh97Wp},
    IS_BEFORE(NOW(),{fld4G9Su5xuZwPY5B})
  ),
  "Active",
  "Past Event"
)
)
  "Recurring Event Multiplier"?: any; // formula - Formula: IF(
  {fldGKPGNleR3Wxk0m} = "Active",
  IF(
  DATETIME_DIFF(NOW(),{fld51vIJGdkNsDRgz},'weeks') >= 0,
  MIN(
    4,
    DATETIME_DIFF(NOW(),{fld51vIJGdkNsDRgz},'weeks')
  ),
  0
  ),
  IF(
    {fldGKPGNleR3Wxk0m} = "Past Event",
    IF(
      DATETIME_DIFF(
        {fld4G9Su5xuZwPY5B},
        IF(
          {fld51vIJGdkNsDRgz} > DATEADD(NOW(), -28, 'days'),
          {fld51vIJGdkNsDRgz},
          DATEADD(NOW(), -28, 'days')
        ),
        'weeks'
      ) > 0,
      DATETIME_DIFF(
        {fld4G9Su5xuZwPY5B},
        IF(
          {fld51vIJGdkNsDRgz} > DATEADD(NOW(), -28, 'days'),
          {fld51vIJGdkNsDRgz},
          DATEADD(NOW(), -28, 'days')
        ),
        'weeks'
      ),
      0
    ),
    0
  )
)
 - Calculates how many weeks an event has been active over the past 28 days (4 weeks). 

-> For ongoing recurrences, it returns the number of weeks since the start capped at 4. 
-> For past recurrences, it computes the overlap in full weeks between the event period and the last 28 days.
-> Non‑recurring events return 0.

  "Start Time"?: string; // dateTime
  "Scheduled for Next Week"?: any; // formula - Formula: IF(
  {fldGKPGNleR3Wxk0m} = "Not Recurring",
  AND(NOT(
        IS_BEFORE(
          {fld51vIJGdkNsDRgz},
          DATEADD(NOW(), 7 - WEEKDAY(NOW()), 'days')
        )
      ),
    IS_BEFORE(
        {fld51vIJGdkNsDRgz},
        DATEADD(NOW(), 14 - WEEKDAY(NOW()),   'days')
    )
  ),
 IF(
  {fldGKPGNleR3Wxk0m} = "Active",
  AND(
    IS_BEFORE({fld51vIJGdkNsDRgz}, DATEADD(NOW(), 14 - WEEKDAY(NOW()), 'days')),
    OR(
      {fld4G9Su5xuZwPY5B} = BLANK(),
      IS_AFTER({fld4G9Su5xuZwPY5B}, DATEADD(NOW(), 7 - WEEKDAY(NOW()), 'days'))
    )
  ),
  FALSE()
)
)
  "test form"?: any; // formula - Formula: {fldjlcXcuanXh97Wp} = BLANK()
  "Recurrence Rule"?: string; // singleLineText
  "Recurring Until"?: any; // formula - Formula: IF(
  {fldpTebrsYTth0n8i},
  {fldpTebrsYTth0n8i},
  IF(
    ISERROR(REGEX_EXTRACT({fldjlcXcuanXh97Wp}, "UNTIL=(\\d{8}T\\d{6})")) = 0,
    DATETIME_PARSE(
      REGEX_EXTRACT({fldjlcXcuanXh97Wp}, "UNTIL=(\\d{8}T\\d{6})"),
      "YYYYMMDDTHHmmss"
    ),
    BLANK()
  )
)

  "Override Recurring Until"?: string; // dateTime
  "Recurring at"?: any; // formula - Formula: IF(
  {fldt7dD4lQeqfJPMj} = "Active",
  DATETIME_FORMAT({fld51vIJGdkNsDRgz}, 'dddd'),
  IF(
    FIND("FREQ=DAILY", {fldjlcXcuanXh97Wp}) > 0,
    "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
    IF(
      REGEX_MATCH({fldjlcXcuanXh97Wp}, "BYDAY="),
      SUBSTITUTE(
        SUBSTITUTE(
          SUBSTITUTE(
            SUBSTITUTE(
              SUBSTITUTE(
                SUBSTITUTE(
                  SUBSTITUTE(
                    SUBSTITUTE(
                      REGEX_EXTRACT({fldjlcXcuanXh97Wp}, "BYDAY=([A-Z,]+)"),
                      ",", ", "
                    ),
                    "MO", "Monday"
                  ),
                  "TU", "Tuesday"
                ),
                "WE", "Wednesday"
              ),
              "TH", "Thursday"
            ),
            "FR", "Friday"
          ),
          "SA", "Saturday"
        ),
        "SU", "Sunday"
      ),
      DATETIME_FORMAT({fld51vIJGdkNsDRgz}, 'dddd')
    )
  )
)

  "Override Recurrence Status"?: "Active" | "Not Recurring"; // singleSelect
  "Duration"?: any; // formula - Formula: DATETIME_DIFF({fldy5QhU4qOfPsBax}, {fld51vIJGdkNsDRgz}, 'minutes')
  "Event Link"?: string; // url
  "Matching Teacher (from Event Attendees)"?: any[]; // multipleLookupValues
  "Email (from Matching Teacher)"?: any[]; // multipleLookupValues
  "Total Lead Attendees"?: any; // count
  "Total Teacher Attendees"?: any; // count
  "Attendee Emails"?: any; // formula - Formula: ARRAYJOIN({fld4maLoT4AxixDn2},", ") & ", " & ARRAYJOIN({fldChR72hhzMpFNlf}, ", ")
  "Lead Emails"?: any[]; // multipleLookupValues
  "Temp - Event Attendees (from API)"?: string; // multilineText
  "Updated Today?"?: boolean; // checkbox
  "Type (from API)"?: string; // singleLineText
  "Created"?: string; // createdTime
  "Override Event Type"?: "Class" | "Internal Event" | "Out of Office" | "Pause" | "Available"; // singleSelect
  "Duration (hours)"?: any; // formula - Formula: ({flddNq4xPQcXeT3Lw} - {fldcECmEYZx6twOwf}) / 60
  "Source"?: any; // formula - Formula: IF(
  {fldt7dD4lQeqfJPMj},
  "Manual Entry",
  "Synced from Calendar"
)
  "testt"?: any; // formula - Formula: AND(
  {fldGKPGNleR3Wxk0m} != "Past Event",

  AND(
    AND(
      IF(
        NOT(ISERROR({fld6G51mfVSEcUXH8})),
        FIND("Wed", {fld6G51mfVSEcUXH8}) > 0,
        DATETIME_FORMAT({fld51vIJGdkNsDRgz}, "YYYY-MM-DD") = "2025-08-27"
      ),
      {flddNq4xPQcXeT3Lw} >= 1230,
      {fldcECmEYZx6twOwf} <= 1275
    )
    ,AND(
      IF(
        NOT(ISERROR({fld6G51mfVSEcUXH8})),
        FIND("Tue", {fld6G51mfVSEcUXH8}) > 0,
        DATETIME_FORMAT({fld51vIJGdkNsDRgz}, "YYYY-MM-DD") = "2025-08-26"
      ),
      {flddNq4xPQcXeT3Lw} >= 750,
      {fldcECmEYZx6twOwf} <= 795
    )
  ),

  OR(
    {fldtFLpD1XNf6IwG4} = "Out of Office",
    {fldtFLpD1XNf6IwG4} = "Pause",
    {fldtFLpD1XNf6IwG4} = "Type Unknown"
  ),

  {fld6BAOiNwmpzfIHZ} = TRUE(),
  FIND("melaniek.fls@gmail.com", {fld0EQOKg3S02YCLO}) > 0
)
  "test3"?: any; // formula - Formula: AND(
  {fldGKPGNleR3Wxk0m} != "Past Event",
  OR(
  AND(
    IF(
      NOT(ISERROR({fld6G51mfVSEcUXH8})),
      FIND("Tue",{fld6G51mfVSEcUXH8}) > 0,
      DATETIME_FORMAT({fld51vIJGdkNsDRgz},"YYYY-MM-DD") = "2025-08-26"
    ),
    {flddNq4xPQcXeT3Lw}   >= 750,
    {fldcECmEYZx6twOwf} <= 795
  ),
  AND(
    IF(
      NOT(ISERROR({fld6G51mfVSEcUXH8})),
      FIND("Wed",{fld6G51mfVSEcUXH8}) > 0,
      DATETIME_FORMAT({fld51vIJGdkNsDRgz},"YYYY-MM-DD") = "2025-08-27"
    ),
    {flddNq4xPQcXeT3Lw} >= 1230,
    {fldcECmEYZx6twOwf} <= 1275
  )
  
),
  OR(
    {fldtFLpD1XNf6IwG4} = "Out of Office",
    {fldtFLpD1XNf6IwG4} = "Pause",
    {fldtFLpD1XNf6IwG4} = "Type Unknown"
  ),
  {fld6BAOiNwmpzfIHZ} = TRUE(),
  FIND("melaniek.fls@gmail.com",{fld0EQOKg3S02YCLO}) > 0
)
}

// Event Attendees
export interface AirtableEventAttendees {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Email"?: string; // email
  "Matching Teacher"?: string[]; // multipleRecordLinks - Links to table ID: tblVkXhmy8qX3FHm4
  "Matching Lead"?: string[]; // multipleRecordLinks - Links to table ID: tblDuD2OQoYgLA2r8
  "Type"?: any; // formula - Formula: IF(
  {flddh8W5G2pGiZYFO},
  "Teacher",
  "Lead"
)
  "Calendar Events"?: string[]; // multipleRecordLinks - Links to table ID: tblo7z7DbVaOGIEmJ
  "Teacher's Total Workload (28 Days)"?: any; // rollup
  "Teacher's Average Workload"?: any; // formula - Formula: {fldQOwn45bUhSBBvT} / 4
  "Teacher's Total Workload (Next Week)"?: any; // rollup
}

// Attendance Records
export interface AirtableAttendanceRecords {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Attendance Record Name"?: any; // formula - Formula: {fldmC29A3a9J3Gs5j} & " - " & {fldE2VAwMltnbmS5k}
  "Class"?: string[]; // multipleRecordLinks - Links to table ID: tbldeW8SeBkDIlywc
  "Student Cohort (from Class)"?: any[]; // multipleLookupValues
  "Student"?: string[]; // multipleRecordLinks - Links to table ID: tblxPJbUJ2UqE7sqF
  "Student Progress Rate"?: "-10 - Did Not Attend - No Comms" | "-11 - Did Not Attend - Student Told In Advance" | "-2 - Far Behind Peers" | "-1 - Somewhat Behind Peers" | "0 - On Track" | "1 - Ahead of Peers" | "2 - Far Ahead of Peers"; // singleSelect
  "Student (from Student)"?: any[]; // multipleLookupValues
  "Student Progress Status Digit"?: any; // formula - Formula: REGEX_EXTRACT({fld7I9oUEcdquvVk0},"[\\d-]+")+0
  "Attended?"?: any; // formula - Formula: IF({fld7I9oUEcdquvVk0}>-10,"Attended","Absent")
  "Student Notes"?: string; // singleLineText
}

// Language Levels
export interface AirtableLanguageLevels {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Signup Form Name"?: string; // singleLineText
  "Students"?: string[]; // multipleRecordLinks - Links to table ID: tblDuD2OQoYgLA2r8
  "Student Assessments"?: string[]; // multipleRecordLinks - Links to table ID: tbl8qPVvfrZfqFd7d
  "Possible for Evaluation"?: "No" | "Yes"; // singleSelect
  "French Programs/Cohorts"?: string[]; // multipleRecordLinks - Links to table ID: tblQYVsRWi8jzt4jh
}

// Student Assessments
export interface AirtableStudentAssessments {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Assessment ID"?: any; // formula - Formula: {fldkWxeAJRLMwG1nF}
  "Assessment Level"?: string[]; // multipleRecordLinks - Links to table ID: tblmTTItwW0GACuEo
  "Student"?: string[]; // multipleRecordLinks - Links to table ID: tblDuD2OQoYgLA2r8
  "Student Record ID"?: any[]; // multipleLookupValues
  "Assessment Call Scheduled For"?: string; // dateTime
  "Invoicing Type"?: "Paid" | "Free"; // singleSelect
  "Result"?: "0 - Scheduled/Requested" | "50 - Session Held" | "100 - Level Determined"; // singleSelect
  "Assessment Notes"?: string; // multilineText
  "Interview Held By"?: string[]; // multipleRecordLinks - Links to table ID: tblVkXhmy8qX3FHm4
  "Level Checked By"?: string[]; // multipleRecordLinks - Links to table ID: tblVkXhmy8qX3FHm4
  "Meeting Recording Link"?: string; // url
  "Paid for/Requested On"?: string; // createdTime
  "Calendar Event URL"?: string; // url
  "Result Last Updated at"?: string; // lastModifiedTime
}

// Teacher Payouts
export interface AirtableTeacherPayouts {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Invoice ID"?: number; // autoNumber
  "Teacher"?: string[]; // multipleRecordLinks - Links to table ID: tblVkXhmy8qX3FHm4
  "Payment Date"?: string; // date
}

// Teacher Certifications
export interface AirtableTeacherCertifications {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Name"?: any; // formula - Formula: {fldfhhV6DkTcnR0Oy} & " - " & {fldYQqASSqQVaxERU}
  "Teacher"?: string[]; // multipleRecordLinks - Links to table ID: tblVkXhmy8qX3FHm4
  "Certificate / License"?: string; // singleLineText
  "Issued Date"?: string; // date
  "Expiration Date"?: string; // date
  "Certification Notes"?: string; // multilineText
}

// Days of Week
export interface AirtableDaysofWeek {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Name"?: string; // singleLineText
  "Day Number"?: number; // number
  "Cohort Weekly Session"?: string[]; // multipleRecordLinks - Links to table ID: tbl42r90BBxZsI1ak
}

// Products
export interface AirtableProducts {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Internal Nickname"?: string; // singleLineText
  "Location"?: "Online" | "In-Person"; // singleSelect
  "Format"?: "Private" | "Group"; // singleSelect
  "Signup Link (for Self-Checkout)"?: string; // url
  "Contract Template ID (PandaDoc)"?: string; // singleLineText
  "French Programs/Cohorts"?: string[]; // multipleRecordLinks - Links to table ID: tblQYVsRWi8jzt4jh
  "Max Students Per Class "?: number; // number
}

// Payments from Student
export interface AirtablePaymentsfromStudent {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Name"?: string; // singleLineText
  "Total"?: number; // currency
  "Student"?: string[]; // multipleRecordLinks - Links to table ID: tblDuD2OQoYgLA2r8
  "Date of Payment"?: string; // dateTime
}

// 1-1 Class Requests
export interface Airtable11ClassRequests {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Name"?: any; // formula - Formula: {fldi1ipMdPhAZnv7k} & " - " & DATETIME_FORMAT({fld1WNI6zMukJivLa},"DD MMM, YYYY")
  "Student"?: string[]; // multipleRecordLinks - Links to table ID: tblDuD2OQoYgLA2r8
  "Email (from Student)"?: any[]; // multipleLookupValues
  "Status"?: "-10 - Archieved" | "00 - New Request" | "20 - Followed Up" | "50 - Assessment Sent" | "100 - Class Booked"; // singleSelect
  "Format"?: "In-person" | "Online"; // singleSelect
  "Assigned Teacher"?: string[]; // multipleRecordLinks - Links to table ID: tblVkXhmy8qX3FHm4
  "Available Days"?: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday")[]; // multipleSelects
  "Available Times"?: ("Morning (8AM-12PM)" | "Afternoon (12PM-5PM)" | "Evening (5PM-9PM)")[]; // multipleSelects
  "Submitted at"?: string; // createdTime
  "Notes from Student"?: string; // multilineText
  "Internal Notes"?: string; // richText
}

// Time Off Requests
export interface AirtableTimeOffRequests {
  id: string; // Airtable record ID
  createdTime: string; // ISO 8601 formatted date
  "Name"?: any; // formula - Formula: "Time Off – " & {fldWlJnOvhQbWC1h2} & ": " & {fldP7WSWSUK3prdMp} & "-" & {fldcJkocsOAVWLhQB}
  "Teacher"?: string[]; // multipleRecordLinks - Links to table ID: tblVkXhmy8qX3FHm4
  "Teacher Full Name (from Teacher)"?: any[]; // multipleLookupValues
  "Start Time"?: string; // dateTime
  "Formatted Start Time"?: any; // formula - Formula: DATETIME_FORMAT({fldh1TuU6TyA8h6fu}, "MMMM D, h:mm a")
  "Formatted End Time"?: any; // formula - Formula: DATETIME_FORMAT({fldtd3BqsRfMNovix}, "MMMM D, h:mm a")
  "End Time"?: string; // dateTime
  "Request Status"?: "Approved" | "Pending" | "Rejected"; // singleSelect
  "Details"?: string; // multilineText
  "Created By"?: { id: string; email: string; name: string }; // createdBy
  "Event Created?"?: boolean; // checkbox
  "Created at"?: string; // createdTime
  "Send Notification"?: any; // formula - Formula: AND(
  DATETIME_DIFF(NOW(),{fldLKnhDk6yhkSUdZ},"days") >= 7,
  {fldwQyVOgtpUmKMT1} = "Pending",
  {fld3qu8pG9Szj9wbN} = FALSE()
)
}

