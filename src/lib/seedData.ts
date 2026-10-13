import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Course, Lesson, Quiz, Assignment, Discussion, SiteSettings } from '../types';

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  siteName: 'LearnSpace',
  announcementBanner: {
    text: 'ยินดีต้อนรับสู่ภาคการศึกษาใหม่! คอร์สเรียนใหม่เปิดให้ลงทะเบียนแล้ววันนี้ พร้อมระบบส่งงานและกระดานแลกเปลี่ยน',
    enabled: true,
    link: '#courses',
  },
  heroConfig: {
    title: 'พื้นที่แห่งการเรียนรู้ไร้ขีดจำกัด พัฒนาทักษะสู่อนาคต',
    subtitle: 'แพลตฟอร์มการศึกษาออนไลน์ที่ออกแบบเพื่อนักเรียน นักศึกษา และคณาจารย์ พร้อมระบบบทเรียน แบบทดสอบ การส่งงาน และชุมชนแลกเปลี่ยนความรู้วิชาการ',
  },
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-web-dev',
    title: 'การพัฒนาเว็บแอปพลิเคชันสมัยใหม่ (Modern Full-Stack Development)',
    slug: 'modern-fullstack-dev',
    description: 'เรียนรู้การพัฒนาเว็บแอปพลิเคชันตั้งแต่พื้นฐานจนถึงระดับมืออาชีพ ครอบคลุม React 19, TypeScript, สถาปัตยกรรม REST API, การเชื่อมต่อ Cloud Firestore และการวางระบบรักษาความปลอดภัยตามมาตรฐานสากล',
    category: 'วิทยาการคอมพิวเตอร์',
    level: 'intermediate',
    coverImage: '/src/assets/images/course_web_dev_1791865330966.jpg',
    instructorId: 'teacher-somchai',
    instructorName: 'ผศ.ดร. สมชาย มั่นคง',
    courseCode: 'CS-201',
    term: 'ภาคเรียนที่ 1/2569',
    room: 'ห้อง 402 / ออนไลน์',
    joinCode: 'LS-201WEB',
    status: 'active',
    published: true,
    totalLessons: 3,
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'course-data-ai',
    title: 'วิทยาศาสตร์ข้อมูลและปัญญาประดิษฐ์ประยุกต์ (Data Science & Applied AI)',
    slug: 'applied-data-science-ai',
    description: 'เจาะลึกกระบวนการวิเคราะห์ข้อมูล การประมวลผลสัญญาณ การสร้างโมเดล Machine Learning และการประยุกต์ใช้โมเดล Large Language Models ในงานวิจัยและการแก้ปัญหาจริงในภาคอุตสาหกรรม',
    category: 'ข้อมูลและปัญญาประดิษฐ์',
    level: 'advanced',
    coverImage: '/src/assets/images/course_data_science_1791865331438.jpg',
    instructorId: 'teacher-kanya',
    instructorName: 'ดร. กัญญา วีระเกียรติ',
    courseCode: 'AI-301',
    term: 'ภาคเรียนที่ 1/2569',
    room: 'ห้อง 501 / ออนไลน์',
    joinCode: 'LS-301DATA',
    status: 'active',
    published: true,
    totalLessons: 2,
    createdAt: '2026-09-05T09:00:00.000Z',
  },
  {
    id: 'course-applied-math',
    title: 'คณิตศาสตร์เชิงคำนวณและเรขาคณิตขั้นสูง (Computational Mathematics)',
    slug: 'computational-mathematics',
    description: 'ศึกษาทฤษฎีสัดส่วนทองคำ เรขาคณิตพหุคุณ เมทริกซ์การแปลงเชิงเส้น และการวิเคราะห์เชิงตัวเลขสำหรับงานวิทยาการคอมพิวเตอร์และกราฟิกจำลอง 3 มิติ',
    category: 'วิทยาศาสตร์และคณิตศาสตร์',
    level: 'beginner',
    coverImage: '/src/assets/images/course_science_math_1791865348977.jpg',
    instructorId: 'teacher-somchai',
    instructorName: 'ผศ.ดร. สมชาย มั่นคง',
    courseCode: 'MATH-101',
    term: 'ภาคเรียนที่ 1/2569',
    room: 'ห้อง 301 / ออนไลน์',
    joinCode: 'LS-101MATH',
    status: 'active',
    published: true,
    totalLessons: 2,
    createdAt: '2026-09-10T10:00:00.000Z',
  },
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'lesson-web-1',
    courseId: 'course-web-dev',
    title: 'บทที่ 1: รากฐานสถาปัตยกรรมเว็บ Client-Server & HTTP Protocol',
    order: 1,
    summary: 'ทำความเข้าใจการทำงานของ Request-Response Cycle, RESTful API Conventions และความแตกต่างของ Stateless Services',
    contentHtml: `
      <div class="space-y-4">
        <h3 class="text-xl font-bold text-slate-900">1. วงจรการสื่อสาร Client-Server</h3>
        <p class="text-slate-700 leading-relaxed">
          ในระบบเว็บแอปพลิเคชันยุคใหม่ การติดต่อสื่อสารระหว่างหน้าเว็บ (Client) และบริการหลังบ้าน (Backend Server) อาศัยมาตรฐาน HTTP/HTTPS เป็นแกนหลัก โดยข้อมูลจะถูกจัดส่งในรูปแบบ JSON Payload ที่มีโครงสร้างชัดเจน
        </p>
        <div class="p-4 bg-slate-100 rounded-lg border border-slate-200">
          <h4 class="font-semibold text-slate-800 mb-2">หัวใจสำคัญของ Stateless Protocol:</h4>
          <ul class="list-disc list-inside space-y-1 text-slate-600 text-sm">
            <li>ทุก Request มีบริบทที่สมบูรณ์ในตัวเอง เช่น Bearer Token สำหรับยืนยันตัวตน</li>
            <li>เซิร์ฟเวอร์ไม่จำเป็นต้องจำ Session ใน Memory ข้ามเครื่อง ทำให้รองรับการขยายตัว (Scalability) ได้ดี</li>
            <li>การแยก Frontend SPA และ Cloud Database ทำให้ระบบยืดหยุ่นและตอบสนองได้รวดเร็ว</li>
          </ul>
        </div>
      </div>
    `,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    attachments: [
      { name: 'Lecture_Slide_Week1.pdf', url: '#', size: 2450000 },
      { name: 'Source_Code_Sample.zip', url: '#', size: 1200000 },
    ],
    published: true,
    createdAt: '2026-09-01T08:30:00.000Z',
  },
  {
    id: 'lesson-web-2',
    courseId: 'course-web-dev',
    title: 'บทที่ 2: การจัดการ State และ Realtime Synchronization ใน React 19',
    order: 2,
    summary: 'เรียนรู้เทคนิคการซิงก์ข้อมูลแบบ Realtime ผ่าน Firestore onSnapshot, การจัดการ Loading/Error States และการป้องกัน Memory Leak',
    contentHtml: `
      <div class="space-y-4">
        <h3 class="text-xl font-bold text-slate-900">2. Realtime Listener และ State Lifecycle</h3>
        <p class="text-slate-700 leading-relaxed">
          การรับข้อมูลสดจาก Cloud Firestore ช่วยให้ผู้เรียนเห็นสถานะการตรวจงาน คะแนน และข้อความในกระดานสนทนาได้ทันทีโดยไม่ต้อง Refresh หน้าเว็บ
        </p>
        <p class="text-slate-700 leading-relaxed">
          สิ่งสำคัญคือการ Unsubscribe Listener เมื่อ Component ถูก Unmount เพื่อป้องกันการสูญเสียทรัพยากร
        </p>
      </div>
    `,
    videoUrl: '',
    attachments: [
      { name: 'React19_State_Guide.pdf', url: '#', size: 1800000 },
    ],
    published: true,
    createdAt: '2026-09-02T08:30:00.000Z',
  },
  {
    id: 'lesson-web-3',
    courseId: 'course-web-dev',
    title: 'บทที่ 3: ความปลอดภัยของระบบเว็บ Zero-Trust RBAC & Input Sanitization',
    order: 3,
    summary: 'การป้องกัน XSS, CSRF, Injection Attacks และการออกแบบ Security Rules เพื่อควบคุมสิทธิ์ของนักเรียนและอาจารย์',
    contentHtml: `
      <div class="space-y-4">
        <h3 class="text-xl font-bold text-slate-900">3. หลักการรักษาความมั่นคงปลอดภัย</h3>
        <p class="text-slate-700 leading-relaxed">
          กฎเหล็กของการพัฒนาเว็บคือ "ห้ามเชื่อถือข้อมูลจากฝั่ง Client โดยเด็ดขาด" การตรวจสอบสิทธิ์ต้องเกิดขึ้นที่ Database Security Rules หรือ Server-Side เสมอ
        </p>
      </div>
    `,
    videoUrl: '',
    attachments: [],
    published: true,
    createdAt: '2026-09-03T08:30:00.000Z',
  },
  {
    id: 'lesson-data-1',
    courseId: 'course-data-ai',
    title: 'บทที่ 1: การสำรวจข้อมูลและสถิติเชิงพรรณนา (Exploratory Data Analysis)',
    order: 1,
    summary: 'การจัดเตรียมข้อมูล การตรวจจับ Outliers และการสร้าง Data Visualizations ด้วย Python',
    contentHtml: `
      <div class="space-y-4">
        <h3 class="text-xl font-bold text-slate-900">1. กระบวนการสำรวจข้อมูล</h3>
        <p class="text-slate-700 leading-relaxed">
          ขั้นตอนแรกของการวิเคราะห์ข้อมูลคือการเข้าใจการกระจายตัวของข้อมูล (Distribution) ค่าเฉลี่ย มัธยฐาน และความแปรปรวน
        </p>
      </div>
    `,
    videoUrl: '',
    attachments: [
      { name: 'Dataset_Sample_2026.csv', url: '#', size: 3400000 },
    ],
    published: true,
    createdAt: '2026-09-05T09:30:00.000Z',
  },
  {
    id: 'lesson-math-1',
    courseId: 'course-applied-math',
    title: 'บทที่ 1: สัดส่วนทองคำ เรขาคณิตพหุคุณ และความงามเชิงสัญลักษณ์',
    order: 1,
    summary: 'ศึกษาความสัมพันธ์ของลำดับฟีโบนัชชี (Fibonacci Sequence) และการนำสัดส่วนทองคำไปใช้ในการออกแบบสถาปัตยกรรมและส่วนประสานผู้ใช้',
    contentHtml: `
      <div class="space-y-4">
        <h3 class="text-xl font-bold text-slate-900">1. มหัศจรรย์ของค่า Phi (φ ≈ 1.618)</h3>
        <p class="text-slate-700 leading-relaxed">
          สัดส่วนทองคำถูกค้นพบในธรรมชาติ ตั้งแต่การจัดเรียงเกสรดอกไม้จนถึงกาแล็กซี การประยุกต์ใช้ในเรขาคณิตคอมพิวเตอร์ช่วยสร้างความกลมกลืนเชิงทัศนศิลป์
        </p>
      </div>
    `,
    videoUrl: '',
    attachments: [],
    published: true,
    createdAt: '2026-09-10T10:30:00.000Z',
  },
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-web-1',
    courseId: 'course-web-dev',
    lessonId: 'lesson-web-1',
    title: 'แบบทดสอบท้ายบทที่ 1: สถาปัตยกรรมเว็บและ HTTP Protocol',
    passingScore: 75,
    questions: [
      {
        id: 'q1',
        prompt: 'HTTP Protocol จัดเป็นโปรโตคอลประเภทใดในการรักษาสถานะ (State)?',
        options: ['Stateful Protocol', 'Stateless Protocol', 'Persistent Connection Protocol', 'Cache-Only Protocol'],
        correctOptionIndex: 1,
        explanation: 'HTTP ถูกออกแบบให้เป็น Stateless Protocol หมายความว่าแต่ละคำขอ (Request) ทำงานอย่างเป็นอิสระและเซิร์ฟเวอร์ไม่ได้จำสถานะของคำขอก่อนหน้า',
      },
      {
        id: 'q2',
        prompt: 'HTTP Status Code ใดที่หมายถึง "Unauthorized" (ยังไม่ได้ยืนยันตัวตน)?',
        options: ['200 OK', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
        correctOptionIndex: 1,
        explanation: '401 หมายถึงคำขอยังขาดข้อมูลรับรองตัวตน (Authentication Credentials) ส่วน 403 หมายถึงรับรู้ตัวตนแล้วแต่ไม่มีสิทธิ์เข้าถึง (Authorization)',
      },
      {
        id: 'q3',
        prompt: 'เหตุใดจึงไม่ควรพึ่งพาระบบรักษาความปลอดภัยจากการตรวจสอบฝั่ง Client เพียงอย่างเดียว?',
        options: [
          'เพราะผู้ใช้ทั่วไปสามารถเปิด Developer Tools แก้ไขโค้ดหรือ Bypass ค่าตัวแปรในเบราว์เซอร์ได้',
          'เพราะเบราว์เซอร์ไม่รองรับ JavaScript',
          'เพราะโค้ดฝั่ง Client ทำงานช้ากว่าเซิร์ฟเวอร์เสมอ',
          'เพราะไม่มีผลต่อความปลอดภัย',
        ],
        correctOptionIndex: 0,
        explanation: 'โค้ดที่รันบนเบราว์เซอร์ของผู้ใช้สามารถถูกตรวจสอบ แก้ไข และส่ง Request ดัดแปลงได้ตลอดเวลา จึงต้องมี Security Rules หรือ Server Guard เป็นด่านหลัก',
      },
      {
        id: 'q4',
        prompt: 'REST API เมธอดใดที่ควรใช้สำหรับการ "สร้างข้อมูลใหม่" ตามมาตรฐานสากล?',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correctOptionIndex: 1,
        explanation: 'POST ใช้สำหรับการสร้างทรัพยากรใหม่ (Create Resource) ในขณะที่ PUT/PATCH ใช้สำหรับปรับปรุง และ GET ใช้สำหรับอ่านข้อมูล',
      },
    ],
    createdAt: '2026-09-01T09:00:00.000Z',
  },
  {
    id: 'quiz-ai-1',
    courseId: 'course-data-ai',
    lessonId: 'lesson-data-1',
    title: 'แบบทดสอบท้ายบทที่ 1: พื้นฐานการสำรวจข้อมูลและ Machine Learning',
    passingScore: 66,
    questions: [
      {
        id: 'q1',
        prompt: 'ขั้นตอนใดสำคัญที่สุดในการเตรียมข้อมูลก่อนส่งเข้าฝึกสอนโมเดล Machine Learning?',
        options: ['การเลือกฟอนต์ของรายงาน', 'การทำความสะอาดข้อมูล (Data Cleaning) และจัดการค่าที่สูญหาย (Missing Values)', 'การลบโค้ดทั้งหมด', 'การลดความละเอียดของหน้าจอ'],
        correctOptionIndex: 1,
        explanation: 'ข้อมูลที่มีคุณภาพและผ่านการทำความสะอาดจะส่งผลต่อความแม่นยำของโมเดลตามหลักการ Garbage In, Garbage Out',
      },
      {
        id: 'q2',
        prompt: 'Overfitting หมายถึงปรากฏการณ์ใดในการฝึกสอนโมเดล?',
        options: [
          'โมเดลจำข้อสอบใน Training Data ได้ดีมากแต่ทำนายข้อมูลใหม่ (Unseen Data) ได้แย่',
          'โมเดลทำงานเร็วเกินไปจนคอมพิวเตอร์ร้อน',
          'โมเดลไม่สามารถเรียนรู้ข้อมูลใดๆ ได้เลย',
          'โมเดลมีขนาดไฟล์เล็กเกินไป',
        ],
        correctOptionIndex: 0,
        explanation: 'Overfitting คือโมเดลจดจำ Noise หรือรูปแบบเฉพาะตัวของชุดฝึกมากเกินไป ทำให้ขาดความสามารถในการ Generalize กับข้อมูลจริงชุดใหม่',
      },
      {
        id: 'q3',
        prompt: 'การวัดผลโมเดลประเภท Classification ที่ข้อมูลไม่สมดุล (Imbalanced Data) ควรใช้ตัวชี้วัดใดดีกว่า Accuracy?',
        options: ['F1-Score / Precision / Recall', 'จำนวนหน้าของเอกสาร', 'ความเร็วรอบพัดลม', 'สีของกราฟ'],
        correctOptionIndex: 0,
        explanation: 'หากข้อมูลมีความไม่สมดุลสูง Accuracy จะทำให้เข้าใจผิด การใช้ Precision, Recall และ F1-Score จะสะท้อนประสิทธิภาพจริงของโมเดลได้ดีกว่า',
      },
    ],
    createdAt: '2026-09-05T10:00:00.000Z',
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-web-1',
    courseId: 'course-web-dev',
    lessonId: 'lesson-web-1',
    title: 'การบ้านชิ้นที่ 1: ออกแบบ Schema ฐานข้อมูลและสร้างแผนผัง REST API',
    instructions: `
      ให้นักเรียนออกแบบผัง ER-Diagram หรือ Schema สำหรับระบบจัดการการศึกษาที่มี Entity อย่างน้อย 4 ชนิด (ผู้ใช้, บทเรียน, ข้อสอบ, การส่งงาน)
      พร้อมระบุประเภทข้อมูล (Data Types) และเขียนคำอธิบายแนวทางการป้องกัน Privilege Escalation สรุปส่งเป็นไฟล์ PDF หรือข้อความประกอบงาน
      
      เกณฑ์การให้คะแนน (เต็ม 100 คะแนน):
      1. ความถูกต้องสมบูรณ์ของ Schema (40 คะแนน)
      2. แผนผังความสัมพันธ์ (30 คะแนน)
      3. มาตรการรักษาความมั่นคงปลอดภัย (20 คะแนน)
      4. รูปแบบความเรียบร้อยและการอธิบาย (10 คะแนน)
    `,
    dueDate: '2026-11-30T23:59:59.000Z',
    maxScore: 100,
    allowLate: true,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'assign-ai-1',
    courseId: 'course-data-ai',
    lessonId: 'lesson-data-1',
    title: 'การบ้านชิ้นที่ 1: วิเคราะห์และทำความสะอาดชุดข้อมูลตัวอย่าง',
    instructions: `
      ให้นักเรียนดาวน์โหลดไฟล์ Dataset ตัวอย่าง และเขียนโค้ด Python เพื่อจัดการ Missing Values, แสดงกราฟความสัมพันธ์ของตัวแปร และเขียนข้อสรุป 3 ข้อจากการสำรวจข้อมูล
      ส่งเป็นไฟล์ Jupyter Notebook (.ipynb) หรือ PDF สรุปผล
    `,
    dueDate: '2026-11-25T23:59:59.000Z',
    maxScore: 50,
    allowLate: false,
    createdAt: '2026-09-05T11:00:00.000Z',
  },
];

export const INITIAL_DISCUSSIONS: Discussion[] = [
  {
    id: 'disc-welcome',
    courseId: null,
    courseTitle: 'ชุมชนทั่วไป',
    lessonId: null,
    title: 'ยินดีต้อนรับสู่ LearnSpace! แนะนำตัวและเป้าหมายการเรียนรู้ของคุณได้ที่นี่',
    content: 'ยินดีต้อนรับเพื่อนๆ นักเรียน นักศึกษา และอาจารย์ทุกท่านสู่แพลตฟอร์ม LearnSpace แนะนำตัวและแบ่งปันความตั้งใจในการพัฒนาทักษะได้เลยครับ มีข้อสงสัยเรื่องการใช้งานสามารถสอบถามได้ในกระทู้นี้เช่นกัน',
    authorId: 'admin-learnspace',
    authorName: 'ผู้ดูแลระบบ LearnSpace',
    authorRole: 'admin',
    replyCount: 2,
    isSolved: false,
    isPinned: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'disc-react-query',
    courseId: 'course-web-dev',
    courseTitle: 'การพัฒนาเว็บแอปพลิเคชันสมัยใหม่',
    lessonId: 'lesson-web-2',
    title: 'สอบถามเรื่องการจัดการ State ใน React 19 ร่วมกับ Realtime Listener ครับ',
    content: 'ในการใช้งาน onSnapshot ของ Firestore กับ React 19 เมื่อผู้ใช้เปลี่ยนหน้าไปมา ควรวางฟังก์ชัน cleanup อย่างไรไม่ให้เกิด memory leak หรือการ listen ซ้ำซ้อนครับ?',
    authorId: 'student-anuson',
    authorName: 'อนุสรณ์ รักเรียน',
    authorRole: 'student',
    replyCount: 1,
    isSolved: true,
    isPinned: false,
    createdAt: '2026-09-15T14:20:00.000Z',
  },
];

/**
 * Initializes Firestore default seed data if collections are currently empty.
 */
export async function seedInitialDatabaseIfEmpty(): Promise<void> {
  try {
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    if (!coursesSnapshot.empty) {
      return; // Already populated
    }

    console.log('Seeding initial LearnSpace data into Cloud Firestore...');
    const batch = writeBatch(db);

    // 1. Site Settings
    batch.set(doc(db, 'site_settings', 'global'), INITIAL_SITE_SETTINGS);

    // 2. Courses
    for (const course of INITIAL_COURSES) {
      batch.set(doc(db, 'courses', course.id), course);
    }

    // 3. Lessons
    for (const lesson of INITIAL_LESSONS) {
      batch.set(doc(db, 'lessons', lesson.id), lesson);
    }

    // 4. Quizzes
    for (const quiz of INITIAL_QUIZZES) {
      batch.set(doc(db, 'quizzes', quiz.id), quiz);
    }

    // 5. Assignments
    for (const assignment of INITIAL_ASSIGNMENTS) {
      batch.set(doc(db, 'assignments', assignment.id), assignment);
    }

    // 6. Discussions
    for (const disc of INITIAL_DISCUSSIONS) {
      batch.set(doc(db, 'discussions', disc.id), disc);
    }

    // 7. Seed sample replies
    batch.set(doc(db, 'replies', 'reply-welcome-1'), {
      id: 'reply-welcome-1',
      topicId: 'disc-welcome',
      authorId: 'teacher-somchai',
      authorName: 'ผศ.ดร. สมชาย มั่นคง',
      authorRole: 'teacher',
      content: 'ยินดีต้อนรับนักศึกษาทุกคนครับ ขอให้สนุกกับการเรียนรู้และส่งงานตามกำหนดเวลานะครับ',
      isAcceptedAnswer: false,
      createdAt: '2026-09-01T01:30:00.000Z',
    });

    batch.set(doc(db, 'replies', 'reply-react-1'), {
      id: 'reply-react-1',
      topicId: 'disc-react-query',
      authorId: 'teacher-somchai',
      authorName: 'ผศ.ดร. สมชาย มั่นคง',
      authorRole: 'teacher',
      content: 'ใน useEffect ให้ return ฟังก์ชัน unsubscribe() ที่ได้จาก onSnapshot(...) เสมอครับ จะเป็นการยกเลิก listener เมื่อคอมโพเนนต์ถูกถอดออกอย่างปลอดภัย',
      isAcceptedAnswer: true,
      createdAt: '2026-09-15T15:00:00.000Z',
    });

    await batch.commit();
    console.log('Successfully seeded LearnSpace database.');
  } catch (err) {
    console.warn('Seed database warning (may have insufficient permission or already populated):', err);
  }
}
