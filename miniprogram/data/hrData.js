// 人力资源模拟数据

// 员工数据
const employeesData = [
  {
    _id: 'E001',
    employeeId: 'E001',
    name: '张三',
    gender: '男',
    birthDate: '1990-01-01',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    departmentId: 'DEPT001',
    departmentName: '财务部',
    position: '财务主管',
    entryDate: '2020-01-01',
    status: 'active',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z'
  },
  {
    _id: 'E002',
    employeeId: 'E002',
    name: '李四',
    gender: '女',
    birthDate: '1992-02-02',
    phone: '13800138002',
    email: 'lisi@example.com',
    departmentId: 'DEPT002',
    departmentName: '销售部',
    position: '销售经理',
    entryDate: '2021-03-01',
    status: 'active',
    createdAt: '2021-03-01T00:00:00Z',
    updatedAt: '2021-03-01T00:00:00Z'
  },
  {
    _id: 'E003',
    employeeId: 'E003',
    name: '王五',
    gender: '男',
    birthDate: '1991-03-03',
    phone: '13800138003',
    email: 'wangwu@example.com',
    departmentId: 'DEPT003',
    departmentName: '采购部',
    position: '采购主管',
    entryDate: '2020-05-01',
    status: 'active',
    createdAt: '2020-05-01T00:00:00Z',
    updatedAt: '2020-05-01T00:00:00Z'
  },
  {
    _id: 'E004',
    employeeId: 'E004',
    name: '赵六',
    gender: '女',
    birthDate: '1993-04-04',
    phone: '13800138004',
    email: 'zhaoliu@example.com',
    departmentId: 'DEPT004',
    departmentName: '生产部',
    position: '生产经理',
    entryDate: '2019-07-01',
    status: 'active',
    createdAt: '2019-07-01T00:00:00Z',
    updatedAt: '2019-07-01T00:00:00Z'
  },
  {
    _id: 'E005',
    employeeId: 'E005',
    name: '孙七',
    gender: '男',
    birthDate: '1994-05-05',
    phone: '13800138005',
    email: 'sunqi@example.com',
    departmentId: 'DEPT005',
    departmentName: '管理部',
    position: '行政助理',
    entryDate: '2022-01-01',
    status: 'active',
    createdAt: '2022-01-01T00:00:00Z',
    updatedAt: '2022-01-01T00:00:00Z'
  }
];

// 薪资数据
const payrollData = [
  {
    _id: 'P001',
    payrollId: 'P2026010001',
    employeeId: 'E001',
    employeeName: '张三',
    departmentName: '财务部',
    period: '2026-01',
    basicSalary: 15000,
    allowances: 3000,
    overtimePay: 1000,
    bonus: 2000,
    deductions: 2000,
    netSalary: 19000,
    status: 'paid',
    createdAt: '2026-01-31T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z'
  },
  {
    _id: 'P002',
    payrollId: 'P2026010002',
    employeeId: 'E002',
    employeeName: '李四',
    departmentName: '销售部',
    period: '2026-01',
    basicSalary: 12000,
    allowances: 2000,
    overtimePay: 500,
    bonus: 5000,
    deductions: 1500,
    netSalary: 18000,
    status: 'paid',
    createdAt: '2026-01-31T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z'
  },
  {
    _id: 'P003',
    payrollId: 'P2026010003',
    employeeId: 'E003',
    employeeName: '王五',
    departmentName: '采购部',
    period: '2026-01',
    basicSalary: 10000,
    allowances: 1500,
    overtimePay: 800,
    bonus: 1000,
    deductions: 1200,
    netSalary: 12100,
    status: 'paid',
    createdAt: '2026-01-31T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z'
  },
  {
    _id: 'P004',
    payrollId: 'P2026010004',
    employeeId: 'E004',
    employeeName: '赵六',
    departmentName: '生产部',
    period: '2026-01',
    basicSalary: 11000,
    allowances: 1800,
    overtimePay: 1200,
    bonus: 1500,
    deductions: 1300,
    netSalary: 14200,
    status: 'paid',
    createdAt: '2026-01-31T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z'
  },
  {
    _id: 'P005',
    payrollId: 'P2026010005',
    employeeId: 'E005',
    employeeName: '孙七',
    departmentName: '管理部',
    period: '2026-01',
    basicSalary: 8000,
    allowances: 1000,
    overtimePay: 300,
    bonus: 500,
    deductions: 800,
    netSalary: 9000,
    status: 'paid',
    createdAt: '2026-01-31T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z'
  }
];

// 考勤数据
const attendanceData = [
  {
    _id: 'A001',
    employeeId: 'E001',
    employeeName: '张三',
    departmentName: '财务部',
    date: '2026-01-01',
    checkInTime: '09:00',
    checkOutTime: '18:00',
    status: '正常',
    createdAt: '2026-01-01T18:00:00Z',
    updatedAt: '2026-01-01T18:00:00Z'
  },
  {
    _id: 'A002',
    employeeId: 'E002',
    employeeName: '李四',
    departmentName: '销售部',
    date: '2026-01-01',
    checkInTime: '09:30',
    checkOutTime: '18:30',
    status: '迟到',
    createdAt: '2026-01-01T18:30:00Z',
    updatedAt: '2026-01-01T18:30:00Z'
  },
  {
    _id: 'A003',
    employeeId: 'E003',
    employeeName: '王五',
    departmentName: '采购部',
    date: '2026-01-01',
    checkInTime: '08:45',
    checkOutTime: '17:45',
    status: '正常',
    createdAt: '2026-01-01T17:45:00Z',
    updatedAt: '2026-01-01T17:45:00Z'
  },
  {
    _id: 'A004',
    employeeId: 'E004',
    employeeName: '赵六',
    departmentName: '生产部',
    date: '2026-01-01',
    checkInTime: '09:15',
    checkOutTime: '19:15',
    status: '正常',
    createdAt: '2026-01-01T19:15:00Z',
    updatedAt: '2026-01-01T19:15:00Z'
  },
  {
    _id: 'A005',
    employeeId: 'E005',
    employeeName: '孙七',
    departmentName: '管理部',
    date: '2026-01-01',
    checkInTime: '09:00',
    checkOutTime: '18:00',
    status: '正常',
    createdAt: '2026-01-01T18:00:00Z',
    updatedAt: '2026-01-01T18:00:00Z'
  }
];

// 部门数据
const departmentsData = [
  {
    _id: 'DEPT001',
    code: 'DEPT001',
    name: '财务部',
    managerId: 'E001',
    managerName: '张三',
    description: '负责公司财务管理、会计核算、财务报表等工作',
    status: 'active',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z'
  },
  {
    _id: 'DEPT002',
    code: 'DEPT002',
    name: '销售部',
    managerId: 'E002',
    managerName: '李四',
    description: '负责公司产品销售、市场推广、客户关系管理等工作',
    status: 'active',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z'
  },
  {
    _id: 'DEPT003',
    code: 'DEPT003',
    name: '采购部',
    managerId: 'E003',
    managerName: '王五',
    description: '负责公司原材料、设备、办公用品等采购工作',
    status: 'active',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z'
  },
  {
    _id: 'DEPT004',
    code: 'DEPT004',
    name: '生产部',
    managerId: 'E004',
    managerName: '赵六',
    description: '负责公司产品生产、质量管理、设备维护等工作',
    status: 'active',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z'
  },
  {
    _id: 'DEPT005',
    code: 'DEPT005',
    name: '管理部',
    managerId: 'E005',
    managerName: '孙七',
    description: '负责公司行政管理、人力资源、后勤保障等工作',
    status: 'active',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z'
  }
];

module.exports = {
  employeesData,
  payrollData,
  attendanceData,
  departmentsData
};