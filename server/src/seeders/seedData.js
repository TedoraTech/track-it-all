const { University, Tag, User, Chat, ChatMember, Post } = require('../models');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

const seedUniversities = async () => {
  const universities = [
    {
      name: 'Massachusetts Institute of Technology',
      code: 'MIT',
      country: 'United States',
      state: 'Massachusetts',
      city: 'Cambridge',
      website: 'https://www.mit.edu',
    },
    {
      name: 'Stanford University',
      code: 'STANFORD',
      country: 'United States',
      state: 'California',
      city: 'Stanford',
      website: 'https://www.stanford.edu',
    },
    {
      name: 'Harvard University',
      code: 'HARVARD',
      country: 'United States',
      state: 'Massachusetts',
      city: 'Cambridge',
      website: 'https://www.harvard.edu',
    },
    {
      name: 'University of Toronto',
      code: 'UTORONTO',
      country: 'Canada',
      state: 'Ontario',
      city: 'Toronto',
      website: 'https://www.utoronto.ca',
    },
    {
      name: 'University of Oxford',
      code: 'OXFORD',
      country: 'United Kingdom',
      state: 'England',
      city: 'Oxford',
      website: 'https://www.ox.ac.uk',
    },
    {
      name: 'University of Cambridge',
      code: 'CAMBRIDGE',
      country: 'United Kingdom',
      state: 'England',
      city: 'Cambridge',
      website: 'https://www.cam.ac.uk',
    },
    {
      name: 'Carnegie Mellon University',
      code: 'CMU',
      country: 'United States',
      state: 'Pennsylvania',
      city: 'Pittsburgh',
      website: 'https://www.cmu.edu',
    },
    {
      name: 'University of California, Berkeley',
      code: 'UCB',
      country: 'United States',
      state: 'California',
      city: 'Berkeley',
      website: 'https://www.berkeley.edu',
    },
    {
      name: 'ETH Zurich',
      code: 'ETHZ',
      country: 'Switzerland',
      city: 'Zurich',
      website: 'https://ethz.ch',
    },
    {
      name: 'University of Melbourne',
      code: 'UMELB',
      country: 'Australia',
      state: 'Victoria',
      city: 'Melbourne',
      website: 'https://www.unimelb.edu.au',
    },
  ];

  for (const university of universities) {
    await University.findOneAndUpdate(
      { code: university.code },
      university,
      { upsert: true, new: true }
    );
  }

  logger.info('Universities seeded successfully');
};

const seedTags = async () => {
  const tags = [
    { name: 'Computer Science', color: '#2196F3', description: 'Computer Science related topics' },
    { name: 'Mathematics', color: '#FF9800', description: 'Mathematics and Statistics' },
    { name: 'Physics', color: '#9C27B0', description: 'Physics and related sciences' },
    { name: 'Engineering', color: '#795548', description: 'Engineering disciplines' },
    { name: 'Biology', color: '#4CAF50', description: 'Biology and Life Sciences' },
    { name: 'Chemistry', color: '#F44336', description: 'Chemistry and Chemical Sciences' },
    { name: 'Study Tips', color: '#607D8B', description: 'Study methods and tips' },
    { name: 'Career Advice', color: '#E91E63', description: 'Career guidance and advice' },
    { name: 'Research', color: '#3F51B5', description: 'Research opportunities and guidance' },
    { name: 'Internships', color: '#00BCD4', description: 'Internship opportunities' },
    { name: 'Scholarships', color: '#CDDC39', description: 'Scholarship information' },
    { name: 'Student Life', color: '#FF5722', description: 'Campus life and activities' },
    { name: 'Housing', color: '#8BC34A', description: 'Student housing and accommodation' },
    { name: 'Visa', color: '#673AB7', description: 'Visa and immigration related' },
    { name: 'Jobs', color: '#009688', description: 'Job opportunities and applications' },
    { name: 'Networking', color: '#FFC107', description: 'Professional networking' },
    { name: 'Events', color: '#FF6F00', description: 'Academic and social events' },
    { name: 'Exams', color: '#D32F2F', description: 'Exam preparation and tips' },
    { name: 'Projects', color: '#1976D2', description: 'Academic and personal projects' },
    { name: 'Resources', color: '#388E3C', description: 'Learning resources and materials' },
  ];

  for (const tag of tags) {
    await Tag.findOneAndUpdate(
      { name: tag.name },
      tag,
      { upsert: true, new: true }
    );
  }

  logger.info('Tags seeded successfully');
};

const seedUsers = async () => {
  // Get university references
  const mit = await University.findOne({ code: 'MIT' });
  const stanford = await University.findOne({ code: 'STANFORD' });
  const harvard = await University.findOne({ code: 'HARVARD' });
  const toronto = await University.findOne({ code: 'UTORONTO' });

  const users = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: await bcrypt.hash('password123', 12),
      university: mit?._id,
      year: 2024,
      semester: 'Fall',
      major: 'Computer Science',
      bio: 'CS student passionate about AI and machine learning. Always happy to help fellow students!',
      interests: ['Artificial Intelligence', 'Machine Learning', 'Web Development'],
      isVerified: true,
      role: 'student',
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: await bcrypt.hash('password123', 12),
      university: stanford?._id,
      year: 2023,
      semester: 'Fall',
      major: 'Data Science',
      bio: 'Data science enthusiast with a focus on healthcare applications.',
      interests: ['Data Science', 'Healthcare', 'Statistics'],
      isVerified: true,
      role: 'student',
    },
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      password: await bcrypt.hash('password123', 12),
      university: harvard?._id,
      year: 2025,
      semester: 'Fall',
      major: 'Biology',
      bio: 'Pre-med student interested in research and clinical applications.',
      interests: ['Medicine', 'Research', 'Biology'],
      isVerified: true,
      role: 'student',
    },
    {
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob.wilson@example.com',
      password: await bcrypt.hash('password123', 12),
      university: toronto?._id,
      year: 2024,
      semester: 'Fall',
      major: 'Engineering',
      bio: 'Mechanical engineering student with interests in robotics and automation.',
      interests: ['Robotics', 'Automation', 'Engineering'],
      isVerified: true,
      role: 'student',
    },
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@studenthub.com',
      password: await bcrypt.hash('admin123', 12),
      university: null, // Admin doesn't need university
      bio: 'Platform administrator ensuring a great experience for all students.',
      isVerified: true,
      role: 'admin',
    },
  ];

  for (const user of users) {
    const existingUser = await User.findOne({ email: user.email });
    if (!existingUser) {
      await User.create(user);
    }
  }

  logger.info('Users seeded successfully');
};

const seedChats = async () => {
  // Get some users for chat creation
  const users = await User.find().limit(5);
  
  if (users.length === 0) {
    logger.warn('No users found, skipping chat seeding');
    return;
  }

  const chats = [
    {
      name: 'MIT Computer Science Study Group',
      description: 'Study group for MIT CS students. Share resources, discuss assignments, and collaborate on projects.',
      category: 'Study Groups',
      university: 'Massachusetts Institute of Technology',
      semester: 'Fall',
      year: 2024,
      tags: ['Computer Science', 'Study Tips', 'MIT'],
      rules: [
        'Be respectful to all members',
        'No spam or self-promotion',
        'Keep discussions relevant to CS topics',
        'Help others when you can',
      ],
      createdBy: users[0]._id,
    },
    {
      name: 'International Students - Visa Help',
      description: 'Support group for international students navigating visa processes and immigration.',
      category: 'Support Groups',
      tags: ['Visa', 'International Students', 'Immigration'],
      rules: [
        'Share accurate information only',
        'Be supportive and helpful',
        'Protect personal information',
        'No legal advice - seek professional help when needed',
      ],
      createdBy: users[1]._id,
    },
    {
      name: 'Data Science Career Network',
      description: 'Connect with fellow data science students and professionals. Share job opportunities and career advice.',
      category: 'Career & Networking',
      tags: ['Data Science', 'Career Advice', 'Networking'],
      rules: [
        'Professional conduct expected',
        'Share opportunities freely',
        'Provide constructive feedback',
        'No discrimination of any kind',
      ],
      createdBy: users[2]._id,
    },
    {
      name: 'Research Opportunities Hub',
      description: 'Discover and share research opportunities across all disciplines.',
      category: 'Academic',
      tags: ['Research', 'Academic', 'Opportunities'],
      rules: [
        'Verify research opportunities before sharing',
        'Respect intellectual property',
        'Encourage collaboration',
        'Share resources generously',
      ],
      createdBy: users[3]._id,
    },
    {
      name: 'Student Life & Events',
      description: 'Stay updated on campus events, social activities, and student life.',
      category: 'Social',
      tags: ['Student Life', 'Events', 'Social'],
      rules: [
        'Keep content appropriate',
        'Verify event details',
        'Be inclusive and welcoming',
        'Have fun and make friends!',
      ],
      createdBy: users[0]._id,
    },
  ];

  for (const chat of chats) {
    const existingChat = await Chat.findOne({ name: chat.name });
    if (!existingChat) {
      const createdChat = await Chat.create(chat);
      
      // Add creator as owner through ChatMember
      await ChatMember.create({
        chatId: createdChat._id,
        userId: chat.createdBy,
        role: 'owner'
      });

      // Add a few other users as members
      const otherUsers = users.filter(u => !u._id.equals(chat.createdBy)).slice(0, 2);
      for (const user of otherUsers) {
        await ChatMember.create({
          chatId: createdChat._id,
          userId: user._id,
          role: 'member'
        });
      }
    }
  }

  logger.info('Chats seeded successfully');
};

const seedPosts = async () => {
  // Get some users for post creation
  const users = await User.find({ role: 'student' }).limit(4);
  
  if (users.length === 0) {
    logger.warn('No users found, skipping post seeding');
    return;
  }

  const posts = [
    {
      title: 'Best Resources for Learning Machine Learning',
      content: `I've been diving deep into machine learning lately and wanted to share some of the best resources I've found:

**Online Courses:**
- Andrew Ng's Machine Learning Course on Coursera
- Fast.ai Practical Deep Learning for Coders
- CS229 Stanford Machine Learning

**Books:**
- "Pattern Recognition and Machine Learning" by Christopher Bishop
- "The Elements of Statistical Learning" by Hastie, Tibshirani, and Friedman
- "Hands-On Machine Learning" by Aurélien Géron

**Practical Resources:**
- Kaggle competitions and datasets
- Google Colab for free GPU access
- GitHub repositories with implementations

What resources have helped you the most? Any hidden gems I should know about?`,
      authorId: users[0]._id,
      category: 'Study Resources',
      university: 'Massachusetts Institute of Technology',
      semester: 'Fall',
      year: 2024,
      tags: ['Machine Learning', 'Computer Science', 'Resources'],
    },
    {
      title: 'Tips for International Students: Navigating Your First Semester',
      content: `Starting university as an international student can be overwhelming. Here are some tips that helped me during my first semester:

**Before Arriving:**
- Complete all visa paperwork early
- Research housing options thoroughly
- Connect with other international students online

**Academic Tips:**
- Attend orientation sessions
- Meet with academic advisors regularly
- Join study groups early
- Don't hesitate to ask for help

**Social Integration:**
- Join student organizations
- Attend campus events
- Be open to new experiences
- Maintain connections with home

**Practical Matters:**
- Set up banking and phone service
- Learn about local transportation
- Understand healthcare options
- Know emergency contacts

Remember, everyone is adjusting too! What tips would you add to this list?`,
      authorId: users[1]._id,
      category: 'Student Life',
      tags: ['International Students', 'Study Tips', 'Student Life'],
    },
    {
      title: 'Research Opportunity: AI in Healthcare Lab',
      content: `Our lab is looking for motivated undergraduate and graduate students to join our research on AI applications in healthcare.

**Project Focus:**
- Machine learning for medical image analysis
- Natural language processing for clinical notes
- Predictive modeling for patient outcomes

**Requirements:**
- Strong programming skills (Python, R)
- Background in ML/statistics
- Interest in healthcare applications
- Ability to commit 10-15 hours per week

**What We Offer:**
- Hands-on research experience
- Mentorship from PhD students and faculty
- Opportunity to publish papers
- Potential funding for exceptional students

**Application Process:**
Send your resume, transcript, and a brief cover letter explaining your interest to: research.ai.health@university.edu

Deadline: November 30th, 2024

Feel free to ask questions in the comments!`,
      authorId: users[2]._id,
      category: 'Research',
      university: 'Harvard University',
      tags: ['Research', 'AI', 'Healthcare', 'Opportunities'],
    },
    {
      title: 'Study Group Formation: Advanced Algorithms (CS 6006)',
      content: `Looking to form a study group for Advanced Algorithms this semester!

**Course Details:**
- CS 6006: Advanced Algorithms
- Professor: Dr. Smith
- Meeting time: Tuesdays/Thursdays 2-3:30 PM

**Study Group Goals:**
- Review lecture materials together
- Work through problem sets collaboratively
- Prepare for exams together
- Share different problem-solving approaches

**What I'm Looking For:**
- 3-5 committed students
- Regular attendance at study sessions
- Willingness to explain concepts to others
- Positive and supportive attitude

**Proposed Schedule:**
- Weekly 2-hour sessions (weekends)
- Extra sessions before exams
- Online collaboration between meetings

Interested? Comment below with your availability and what you hope to get out of the study group!`,
      authorId: users[3]._id,
      category: 'Study Groups',
      university: 'University of Toronto',
      semester: 'Fall',
      year: 2024,
      tags: ['Study Groups', 'Algorithms', 'Computer Science'],
    },
    {
      title: 'Internship Experience: Summer at Tech Startup',
      content: `Just finished an amazing summer internship at a tech startup and wanted to share my experience!

**Company Background:**
- Series A startup focused on EdTech
- Team of ~50 people
- Remote-first culture

**My Role:**
- Full-stack development intern
- Worked on user authentication system
- Built new features for the mobile app
- Contributed to API design

**What I Learned:**
- Real-world application of CS concepts
- Agile development practices
- Code review processes
- Product development lifecycle
- Importance of user feedback

**Key Takeaways:**
- Startups move fast - be ready to adapt
- Ask questions early and often
- Take initiative on projects
- Network with everyone, not just your team
- Document your achievements

**Advice for Applicants:**
- Build a strong portfolio on GitHub
- Practice coding interviews regularly
- Research the company thoroughly
- Show genuine interest in their mission
- Follow up after interviews

Happy to answer any questions about the internship search process or startup life!`,
      authorId: users[0]._id,
      category: 'Career Advice',
      tags: ['Internships', 'Career Advice', 'Tech', 'Startups'],
    },
  ];

  for (const post of posts) {
    const existingPost = await Post.findOne({ title: post.title });
    if (!existingPost) {
      await Post.create({
        ...post,
        lastActivityAt: new Date(),
      });
    }
  }

  logger.info('Posts seeded successfully');
};

const seedData = async () => {
  try {
    logger.info('Starting database seeding...');
    
    await seedUniversities();
    await seedTags();
    await seedUsers();
    await seedChats();
    await seedPosts();
    
    logger.info('Database seeding completed successfully!');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = seedData;
