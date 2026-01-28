# CV Data Flow Documentation

## Overview

This document explains how CV data flows through the system from upload to AI processing to database storage.

## Complete Flow Diagram

```
User Uploads CV (PDF)
      ↓
Frontend: parseResumeWithQwen/Gemini(file)
      ↓
Backend: POST /resume/parse/qwen
      ↓
Gradio Python Service: CV Parser
      ↓
Returns: { display: string, json: rawParsedData }
      ↓
Frontend: createResume({ title, data: rawParsedData })
      ↓
Backend: POST /resume
      ↓
ResumeService.create(userId, dto)
      ↓
Database Storage:
  - Resume.data = rawParsedData (for AI operations)
  - Resume.sections = auto-generated (for Resume Builder UI)
      ↓
Frontend: Navigate to /resume-builder/{id}
      ↓
Resume Builder loads sections from DB
```

## Data Formats

### 1. Raw Parsed JSON (from Parser)

**Location**: `Resume.data` field in database

**Format**: Matches `python/cv_template_camelCase.json`

```json
{
  "personalInformation": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "San Francisco, CA",
    "summary": "Experienced software engineer...",
    "links": ["https://linkedin.com/in/johndoe", "https://github.com/johndoe"]
  },
  "workExperience": [
    {
      "jobTitle": "Senior Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "startDate": "2020-01",
      "endDate": null,
      "description": ["Led team of 5 engineers", "Built microservices"],
      "tags": ["Python", "AWS"]
    }
  ],
  "education": [
    {
      "degree": "B.S. Computer Science",
      "institution": "Stanford University",
      "location": "Palo Alto, CA",
      "startDate": "2015-09",
      "endDate": "2019-06",
      "gpa": "3.8"
    }
  ],
  "skills": ["Python", "JavaScript", "AWS", "Docker"],
  "certifications": [],
  "projects": [],
  "languages": [
    { "language": "English", "proficiency": "Native" },
    { "language": "Spanish", "proficiency": "Professional" }
  ]
}
```

**Usage**: 
- ✅ AI Review (`/resume/:id/review`)
- ✅ AI Rewriting (`/resume/:id/rewrite`)
- ✅ Career Advisor (`/resume/:id/career-advice`)
- ✅ Job Matching (`/resume/match-job`)

### 2. Resume Sections (Database Structure)

**Location**: `ResumeSection` table entries

**Format**: Structured data for Resume Builder UI

```typescript
{
  id: string;
  resumeId: string;
  type: ResumeSectionType; // PROFILE, SUMMARY, EXPERIENCE, EDUCATION, etc.
  title: string;
  content: Json; // Section-specific structure
  order: number;
}
```

**Example Section Content**:

```json
// Experience Section
{
  "entries": [
    {
      "company": "Tech Corp",
      "position": "Senior Software Engineer",
      "location": "San Francisco, CA",
      "startDate": "2020-01",
      "endDate": null,
      "current": true,
      "description": "Led team of 5 engineers\nBuilt microservices",
      "achievements": []
    }
  ]
}

// Skills Section
{
  "categories": [
    {
      "name": "Technical Skills",
      "skills": ["Python", "JavaScript", "AWS", "Docker"]
    }
  ]
}
```

**Usage**:
- ✅ Resume Builder UI (`/resume-builder/:id`)
- ✅ Section CRUD operations
- ✅ Resume preview and rendering

## Key Components

### Backend

#### 1. `resume.service.ts` - Main Service

**`create(userId, dto)`**
- Accepts `CreateResumeDto` with raw parsed JSON in `data` field
- Stores raw JSON in `Resume.data`
- Auto-generates sections via `autoGenerateSectionsFromParsedData()`
- Returns resume with populated sections

**`autoGenerateSectionsFromParsedData(resumeId, parsedData)`**
- Transforms raw parsed JSON into ResumeSection entries
- Handles all section types: profile, summary, experience, education, skills, projects, languages, certifications
- Maintains proper order
- Batch creates sections in database

#### 2. `gradio.service.ts` - AI Integration

**Parser Methods**:
- `parseResumeGemini(fileBuffer, fileName)` → Returns `{ display, json }`
- `parseResumeQwen(fileBuffer, fileName)` → Returns `{ display, json }`

**AI Operation Methods** (all expect raw parsed JSON format):
- `reviewResume(resumeData, options)`
- `reviewResumeMultilingual(resumeData, options)`
- `rewriteResume(resumeData, options)`
- `matchJobWithCV(resumeData, jobOptions, userId)`
- `getCareerAdvice(resumeData, desiredPaths, intentions, options)`

#### 3. `resume.controller.ts` - API Endpoints

**Parsing**:
- `POST /resume/parse/gemini` - Parse CV with Gemini
- `POST /resume/parse/qwen` - Parse CV with Qwen

**CRUD**:
- `POST /resume` - Create resume (stores raw JSON)
- `GET /resume/:id` - Get resume with sections
- `PUT /resume/:id` - Update resume

**AI Operations** (use raw JSON from `Resume.data`):
- `POST /resume/:id/review`
- `POST /resume/:id/rewrite`
- `POST /resume/:id/career-advice`
- `POST /resume/match-job`

### Frontend

#### 1. `resume-actions.ts` - Server Actions

**Parsing**:
```typescript
parseResumeWithGemini(file) → { success, data: { display, json } }
parseResumeWithQwen(file) → { success, data: { display, json } }
```

**CRUD**:
```typescript
createResume({ title, data }) → Creates resume with raw JSON
getResume(id) → Fetches resume with sections
```

#### 2. `new-resume/page.tsx` - Import Flow

**Current Implementation** ✅:
```typescript
const parseResult = await parseResumeWithQwen(file);
const parsedJsonData = parseResult.data.json; // Raw parsed JSON

// Create resume with raw JSON
const result = await createResume({
  title: `Imported Resume - ${name}`,
  data: parsedJsonData, // ✅ Raw JSON for AI compatibility
});

// Navigate to editor
router.push(`/resume-builder/${result.data.id}`);
```

#### 3. `[resumeId]/page.tsx` - Resume Builder

**Loads from sections**:
- Fetches `Resume` with `sections[]`
- Converts sections to client format
- Renders Resume Builder UI

## Best Practices

### ✅ DO:

1. **Always store raw parsed JSON in `Resume.data`**
   - Ensures AI operations work correctly
   - Maintains compatibility with Gradio Python service
   - Preserves original CV structure

2. **Use sections for Resume Builder UI**
   - Auto-generated from raw JSON on creation
   - User can modify via Resume Builder
   - Structured for easy rendering

3. **Keep both formats in sync**
   - When user edits in Resume Builder, sections update
   - Raw JSON in `data` remains for AI operations
   - Consider adding sync mechanism if needed

### ❌ DON'T:

1. **Don't transform raw JSON before storing**
   - Frontend should pass raw parsed JSON directly
   - Backend handles section generation

2. **Don't send Resume Builder format to AI operations**
   - AI expects raw parsed JSON format
   - Use `Resume.data`, not sections

3. **Don't manually create sections on frontend**
   - Backend auto-generates sections
   - Reduces code duplication
   - Ensures consistency

## Migration Path (If Needed)

If existing resumes have wrong format in `data` field:

```typescript
// Migration script
async function fixResumeDataFormat() {
  const resumes = await prisma.resume.findMany({
    include: { sections: true }
  });

  for (const resume of resumes) {
    // Check if data is in wrong format (has sections/sectionOrder)
    if (resume.data && resume.data.sections) {
      // Try to reconstruct raw format from sections
      const rawData = reconstructRawFormat(resume.sections);
      
      await prisma.resume.update({
        where: { id: resume.id },
        data: { data: rawData }
      });
    }
  }
}
```

## Testing

### Test CV Import Flow:

1. Upload PDF via `/resume-builder/new-resume`
2. Verify parser returns correct format
3. Check database:
   - `Resume.data` contains raw parsed JSON
   - `ResumeSection` entries created
4. Navigate to Resume Builder
5. Verify all sections render correctly
6. Test AI operations (review, rewrite, career advice)
7. Confirm AI operations work with `Resume.data`

### Test AI Operations:

```bash
# Review Resume
POST /resume/:id/review
→ Should read from Resume.data
→ Should work with raw parsed JSON format

# Rewrite Resume
POST /resume/:id/rewrite
→ Should read from Resume.data
→ Should return enhanced raw JSON

# Career Advice
POST /resume/:id/career-advice
→ Should read from Resume.data
→ Should provide personalized guidance
```

## Troubleshooting

### Issue: AI operations fail with format error

**Cause**: `Resume.data` contains transformed format instead of raw JSON

**Fix**: Ensure frontend passes raw parsed JSON to `createResume()`

### Issue: Resume Builder shows empty after import

**Cause**: Sections not created in database

**Fix**: Backend `create()` method should call `autoGenerateSectionsFromParsedData()`

### Issue: Sections don't match raw data

**Cause**: Transformation logic mismatch

**Fix**: Review `autoGenerateSectionsFromParsedData()` mapping logic

## Summary

✅ **Correct Flow**:
- Raw JSON → `Resume.data` (for AI)
- Raw JSON → Auto-generate sections (for UI)
- Keep both in database
- AI reads from `data`, UI reads from `sections`

This architecture ensures:
- AI operations work correctly with expected format
- Resume Builder has structured data for UI
- Data integrity and consistency
- Scalability and maintainability
