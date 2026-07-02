import type {
  Group, Coach, Athlete, AttendanceRecord, ScheduleSlot,
  Payment, PaymentMethod, EquipmentItem, EquipmentAssignment, Competition,
} from '../types'

// ─── Groups ──────────────────────────────────────────────────────────────────
export const groups: Group[] = [
  { id: 'g1', name: 'Mini Wrestlers', ageRange: '6–9',   coachId: 'c1', color: '#dea835' },
  { id: 'g2', name: 'Youth',          ageRange: '10–13', coachId: 'c2', color: '#3b82f6' },
  { id: 'g3', name: 'Cadets',         ageRange: '14–17', coachId: 'c1', color: '#10b981' },
  { id: 'g4', name: 'Juniors',        ageRange: '18–20', coachId: 'c3', color: '#8b5cf6' },
  { id: 'g5', name: 'Seniors',        ageRange: '21+',   coachId: 'c2', color: '#ef4444' },
]

// ─── Coaches ─────────────────────────────────────────────────────────────────
export const coaches: Coach[] = [
  { id: 'c1', name: 'Nikos Papadopoulos', role: 'Head Coach',      phone: '+30 694 111 2222' },
  { id: 'c2', name: 'Maria Stavrou',      role: 'Assistant Coach', phone: '+30 694 333 4444' },
  { id: 'c3', name: 'Giorgos Alexiou',   role: 'Assistant Coach', phone: '+30 694 555 6666' },
]

// ─── Athletes ────────────────────────────────────────────────────────────────
export const athletes: Athlete[] = [
  {
    id: 'a1', firstName: 'Alexandros', lastName: 'Dimitriou',
    dob: '2010-03-14', gender: 'M', phone: '+30 694 000 0001',
    parentName: 'Kostas Dimitriou', parentPhone: '+30 694 000 0011',
    email: 'alex.d@example.com', groupIds: ['g2'],
    joinDate: '2022-09-01', active: true,
    weight: 42, height: 152,
    medicalNotes: '',
    avatar: null,
  },
  {
    id: 'a2', firstName: 'Sofia', lastName: 'Papadaki',
    dob: '2008-07-22', gender: 'F', phone: '+30 694 000 0002',
    parentName: 'Elena Papadaki', parentPhone: '+30 694 000 0012',
    email: 'sofia.p@example.com', groupIds: ['g3'],
    joinDate: '2021-09-01', active: true,
    weight: 55, height: 163,
    medicalNotes: 'Mild asthma – inhaler on site',
    avatar: null,
  },
  {
    id: 'a3', firstName: 'Petros', lastName: 'Nikolaou',
    dob: '2006-11-05', gender: 'M', phone: '+30 694 000 0003',
    parentName: 'Andreas Nikolaou', parentPhone: '+30 694 000 0013',
    email: 'petros.n@example.com', groupIds: ['g3', 'g4'],
    joinDate: '2020-01-10', active: true,
    weight: 68, height: 174,
    medicalNotes: '',
    avatar: null,
  },
  {
    id: 'a4', firstName: 'Ioanna', lastName: 'Georgiou',
    dob: '2014-01-30', gender: 'F', phone: '+30 694 000 0004',
    parentName: 'Stavros Georgiou', parentPhone: '+30 694 000 0014',
    email: 'ioanna.g@example.com', groupIds: ['g1'],
    joinDate: '2023-09-01', active: true,
    weight: 28, height: 120,
    medicalNotes: '',
    avatar: null,
  },
  {
    id: 'a5', firstName: 'Michalis', lastName: 'Konstantinou',
    dob: '2004-05-18', gender: 'M', phone: '+30 694 000 0005',
    parentName: '', parentPhone: '',
    email: 'michalis.k@example.com', groupIds: ['g5'],
    joinDate: '2019-03-01', active: true,
    weight: 80, height: 180,
    medicalNotes: '',
    avatar: null,
  },
  {
    id: 'a6', firstName: 'Eleni', lastName: 'Vasiliou',
    dob: '2005-09-09', gender: 'F', phone: '+30 694 000 0006',
    parentName: '', parentPhone: '',
    email: 'eleni.v@example.com', groupIds: ['g4', 'g5'],
    joinDate: '2020-09-01', active: true,
    weight: 59, height: 168,
    medicalNotes: '',
    avatar: null,
  },
  {
    id: 'a7', firstName: 'Thanasis', lastName: 'Makris',
    dob: '2012-06-15', gender: 'M', phone: '+30 694 000 0007',
    parentName: 'Giannis Makris', parentPhone: '+30 694 000 0017',
    email: 'thanasis.m@example.com', groupIds: ['g2'],
    joinDate: '2023-01-15', active: true,
    weight: 35, height: 138,
    medicalNotes: '',
    avatar: null,
  },
  {
    id: 'a8', firstName: 'Katerina', lastName: 'Tsiouma',
    dob: '2009-04-02', gender: 'F', phone: '+30 694 000 0008',
    parentName: 'Vassilis Tsioumas', parentPhone: '+30 694 000 0018',
    email: 'katerina.t@example.com', groupIds: ['g2', 'g3'],
    joinDate: '2022-01-10', active: false,
    weight: 47, height: 155,
    medicalNotes: '',
    avatar: null,
  },
  {
    id: 'a9', firstName: 'Nikos', lastName: 'Antoniou',
    dob: '2003-12-20', gender: 'M', phone: '+30 694 000 0009',
    parentName: '', parentPhone: '',
    email: 'nikos.a@example.com', groupIds: ['g5'],
    joinDate: '2018-09-01', active: true,
    weight: 74, height: 176,
    medicalNotes: '',
    avatar: null,
  },
  {
    id: 'a10', firstName: 'Dimos', lastName: 'Papageorgiou',
    dob: '2015-08-11', gender: 'M', phone: '+30 694 000 0010',
    parentName: 'Spyros Papageorgiou', parentPhone: '+30 694 000 0020',
    email: 'dimos.p@example.com', groupIds: ['g1'],
    joinDate: '2023-09-01', active: true,
    weight: 25, height: 115,
    medicalNotes: '',
    avatar: null,
  },
]

// ─── Attendance ───────────────────────────────────────────────────────────────
const genAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = []
  const today = new Date(2026, 5, 30) // 30 Jun 2026
  athletes.forEach(a => {
    for (let w = 0; w < 12; w++) {
      for (const d of [1, 3]) { // Mon & Wed
        const date = new Date(today)
        date.setDate(today.getDate() - w * 7 - (today.getDay() - d + 7) % 7)
        const present = Math.random() > 0.2
        records.push({
          athleteId: a.id,
          date: date.toISOString().split('T')[0],
          present,
          groupId: a.groupIds[0],
        })
      }
    }
  })
  return records
}
export const attendanceRecords: AttendanceRecord[] = genAttendance()

// ─── Schedule ─────────────────────────────────────────────────────────────────
export const scheduleSlots: ScheduleSlot[] = [
  { id: 's1',  groupId: 'g1', day: 1, startTime: '16:00', endTime: '17:00', location: 'Mat Room A' },
  { id: 's2',  groupId: 'g1', day: 3, startTime: '16:00', endTime: '17:00', location: 'Mat Room A' },
  { id: 's3',  groupId: 'g2', day: 1, startTime: '17:00', endTime: '18:30', location: 'Mat Room A' },
  { id: 's4',  groupId: 'g2', day: 3, startTime: '17:00', endTime: '18:30', location: 'Mat Room A' },
  { id: 's5',  groupId: 'g2', day: 5, startTime: '10:00', endTime: '11:30', location: 'Mat Room B' },
  { id: 's6',  groupId: 'g3', day: 1, startTime: '18:30', endTime: '20:00', location: 'Mat Room A' },
  { id: 's7',  groupId: 'g3', day: 3, startTime: '18:30', endTime: '20:00', location: 'Mat Room A' },
  { id: 's8',  groupId: 'g3', day: 5, startTime: '11:30', endTime: '13:00', location: 'Mat Room B' },
  { id: 's9',  groupId: 'g4', day: 2, startTime: '18:00', endTime: '20:00', location: 'Mat Room A' },
  { id: 's10', groupId: 'g4', day: 4, startTime: '18:00', endTime: '20:00', location: 'Mat Room A' },
  { id: 's11', groupId: 'g5', day: 2, startTime: '20:00', endTime: '22:00', location: 'Mat Room A' },
  { id: 's12', groupId: 'g5', day: 4, startTime: '20:00', endTime: '22:00', location: 'Mat Room A' },
  { id: 's13', groupId: 'g5', day: 6, startTime: '09:00', endTime: '11:00', location: 'Mat Room A' },
]

// ─── Payments ────────────────────────────────────────────────────────────────
const MONTHLY_FEE = 40 // € per month
const METHODS: PaymentMethod[] = ['cash', 'bank transfer', 'card']

const genPayments = (): Payment[] => {
  const payments: Payment[] = []
  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']
  athletes.filter(a => a.active).forEach(a => {
    months.forEach(month => {
      const paid = Math.random() > 0.15
      payments.push({
        id: `pay-${a.id}-${month}`,
        athleteId: a.id,
        month,
        amount: MONTHLY_FEE,
        paid,
        paidOn: paid ? `${month}-${String(Math.floor(Math.random() * 20 + 1)).padStart(2, '0')}` : null,
        method: paid ? METHODS[Math.floor(Math.random() * 3)] : null,
      })
    })
  })
  return payments
}
export const payments: Payment[] = genPayments()
export const MONTHLY_FEE_DEFAULT = MONTHLY_FEE

// ─── Equipment ───────────────────────────────────────────────────────────────
export const equipmentCatalog: EquipmentItem[] = [
  { id: 'eq1', name: 'Singlet',         unitPrice: 35, category: 'Clothing' },
  { id: 'eq2', name: 'Headgear',        unitPrice: 25, category: 'Protection' },
  { id: 'eq3', name: 'Wrestling Shoes', unitPrice: 60, category: 'Footwear' },
  { id: 'eq4', name: 'Knee Pad',        unitPrice: 15, category: 'Protection' },
  { id: 'eq5', name: 'Mouth Guard',     unitPrice: 10, category: 'Protection' },
  { id: 'eq6', name: 'Club Bag',        unitPrice: 45, category: 'Accessories' },
]

export const equipmentAssignments: EquipmentAssignment[] = [
  { id: 'ea1',  athleteId: 'a1', itemId: 'eq1', size: 'S',   quantity: 1, assignedDate: '2022-09-05', paid: true,  returnDate: null },
  { id: 'ea2',  athleteId: 'a1', itemId: 'eq2', size: null,  quantity: 1, assignedDate: '2022-09-05', paid: true,  returnDate: null },
  { id: 'ea3',  athleteId: 'a2', itemId: 'eq1', size: 'M',   quantity: 1, assignedDate: '2021-09-10', paid: true,  returnDate: null },
  { id: 'ea4',  athleteId: 'a2', itemId: 'eq3', size: '38',  quantity: 1, assignedDate: '2021-09-10', paid: false, returnDate: null },
  { id: 'ea5',  athleteId: 'a3', itemId: 'eq1', size: 'L',   quantity: 1, assignedDate: '2020-01-15', paid: true,  returnDate: null },
  { id: 'ea6',  athleteId: 'a3', itemId: 'eq3', size: '42',  quantity: 1, assignedDate: '2020-01-15', paid: true,  returnDate: null },
  { id: 'ea7',  athleteId: 'a3', itemId: 'eq6', size: null,  quantity: 1, assignedDate: '2020-06-01', paid: true,  returnDate: null },
  { id: 'ea8',  athleteId: 'a5', itemId: 'eq1', size: 'XL',  quantity: 1, assignedDate: '2019-03-05', paid: true,  returnDate: null },
  { id: 'ea9',  athleteId: 'a5', itemId: 'eq3', size: '44',  quantity: 1, assignedDate: '2019-03-05', paid: true,  returnDate: null },
  { id: 'ea10', athleteId: 'a6', itemId: 'eq1', size: 'M',   quantity: 1, assignedDate: '2020-09-05', paid: true,  returnDate: null },
  { id: 'ea11', athleteId: 'a7', itemId: 'eq5', size: null,  quantity: 1, assignedDate: '2023-01-20', paid: false, returnDate: null },
  { id: 'ea12', athleteId: 'a9', itemId: 'eq1', size: 'L',   quantity: 1, assignedDate: '2018-09-05', paid: true,  returnDate: '2020-01-10' },
  { id: 'ea13', athleteId: 'a9', itemId: 'eq6', size: null,  quantity: 1, assignedDate: '2019-01-10', paid: true,  returnDate: null },
  { id: 'ea14', athleteId: 'a4', itemId: 'eq4', size: 'XS',  quantity: 2, assignedDate: '2023-09-05', paid: false, returnDate: null },
]

// ─── Competitions ─────────────────────────────────────────────────────────────
export const competitions: Competition[] = [
  {
    id: 'comp1', name: 'Regional Youth Championship', date: '2026-03-15',
    location: 'Ioannina Sports Hall', results: [
      { athleteId: 'a1', weightClass: '42kg', place: 2, medal: 'silver' },
      { athleteId: 'a7', weightClass: '35kg', place: 1, medal: 'gold' },
    ],
  },
  {
    id: 'comp2', name: 'National Cadet Cup', date: '2026-04-20',
    location: 'Athens Olympic Complex', results: [
      { athleteId: 'a2', weightClass: '55kg', place: 3, medal: 'bronze' },
      { athleteId: 'a3', weightClass: '68kg', place: 1, medal: 'gold' },
    ],
  },
  {
    id: 'comp3', name: 'Epirus Open', date: '2026-05-10',
    location: 'Preveza Indoor Arena', results: [
      { athleteId: 'a5', weightClass: '80kg', place: 1, medal: 'gold' },
      { athleteId: 'a6', weightClass: '59kg', place: 2, medal: 'silver' },
      { athleteId: 'a9', weightClass: '74kg', place: 4, medal: null },
    ],
  },
]
