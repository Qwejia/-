// 供应链管理模拟数据

// 采购订单数据
const purchaseOrdersData = [
  {
    _id: '1',
    orderNumber: 'PO2026010001',
    supplierId: 'S001',
    supplierName: '北京供应商有限公司',
    orderDate: '2026-01-01',
    expectedDeliveryDate: '2026-01-10',
    totalAmount: 100000,
    status: 'completed',
    items: [
      {
        productId: 'P001',
        productName: '笔记本电脑',
        quantity: 10,
        unitPrice: 8000,
        amount: 80000
      },
      {
        productId: 'P002',
        productName: '打印机',
        quantity: 5,
        unitPrice: 4000,
        amount: 20000
      }
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    _id: '2',
    orderNumber: 'PO2026010002',
    supplierId: 'S002',
    supplierName: '上海供应商有限公司',
    orderDate: '2026-01-05',
    expectedDeliveryDate: '2026-01-15',
    totalAmount: 50000,
    status: 'pending',
    items: [
      {
        productId: 'P003',
        productName: '办公桌椅',
        quantity: 20,
        unitPrice: 2500,
        amount: 50000
      }
    ],
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z'
  }
];

// 销售订单数据
const salesOrdersData = [
  {
    _id: '1',
    orderNumber: 'SO2026010001',
    customerId: 'C001',
    customerName: '北京科技有限公司',
    orderDate: '2026-01-02',
    expectedDeliveryDate: '2026-01-12',
    totalAmount: 150000,
    status: 'completed',
    items: [
      {
        productId: 'P001',
        productName: '笔记本电脑',
        quantity: 15,
        unitPrice: 10000,
        amount: 150000
      }
    ],
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-12T00:00:00Z'
  },
  {
    _id: '2',
    orderNumber: 'SO2026010002',
    customerId: 'C002',
    customerName: '上海贸易有限公司',
    orderDate: '2026-01-08',
    expectedDeliveryDate: '2026-01-20',
    totalAmount: 80000,
    status: 'pending',
    items: [
      {
        productId: 'P002',
        productName: '打印机',
        quantity: 10,
        unitPrice: 8000,
        amount: 80000
      }
    ],
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: '2026-01-08T00:00:00Z'
  }
];

// 库存数据
const inventoryData = [
  {
    _id: '1',
    productId: 'P001',
    productName: '笔记本电脑',
    spec: 'ThinkPad X1',
    unit: '台',
    category: '电子设备',
    price: 8999,
    stock: 100,
    minStock: 10,
    maxStock: 200,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    _id: '2',
    productId: 'P002',
    productName: '打印机',
    spec: 'HP LaserJet Pro',
    unit: '台',
    category: '办公设备',
    price: 4599,
    stock: 50,
    minStock: 5,
    maxStock: 100,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    _id: '3',
    productId: 'P003',
    productName: '办公桌椅',
    spec: '现代简约',
    unit: '套',
    category: '办公家具',
    price: 2999,
    stock: 30,
    minStock: 5,
    maxStock: 50,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    _id: '4',
    productId: 'P004',
    productName: '显示器',
    spec: 'Dell 27英寸',
    unit: '台',
    category: '电子设备',
    price: 1999,
    stock: 80,
    minStock: 10,
    maxStock: 150,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    _id: '5',
    productId: 'P005',
    productName: '键盘鼠标',
    spec: '罗技无线',
    unit: '套',
    category: '电子设备',
    price: 299,
    stock: 200,
    minStock: 20,
    maxStock: 300,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

// 客户数据
const customersData = [
  {
    _id: 'C001',
    code: 'C001',
    name: '北京科技有限公司',
    contact: '张三',
    phone: '13800138001',
    address: '北京市朝阳区',
    bank: '工商银行北京分行',
    bankAccount: '6222020200012345678',
    taxNo: '911100007109291097',
    creditLimit: 1000000,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    _id: 'C002',
    code: 'C002',
    name: '上海贸易有限公司',
    contact: '李四',
    phone: '13800138002',
    address: '上海市浦东新区',
    bank: '建设银行上海分行',
    bankAccount: '6227000012345678901',
    taxNo: '913100007109291097',
    creditLimit: 800000,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    _id: 'C003',
    code: 'C003',
    name: '广州制造有限公司',
    contact: '王五',
    phone: '13800138003',
    address: '广州市天河区',
    bank: '农业银行广州分行',
    bankAccount: '6228000012345678901',
    taxNo: '914401007109291097',
    creditLimit: 600000,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

// 供应商数据
const suppliersData = [
  {
    _id: 'S001',
    code: 'S001',
    name: '北京供应商有限公司',
    contact: '赵六',
    phone: '13900139001',
    address: '北京市海淀区',
    bank: '工商银行北京分行',
    bankAccount: '6222020200012345678',
    taxNo: '911100007109291097',
    creditLimit: 2000000,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    _id: 'S002',
    code: 'S002',
    name: '上海供应商有限公司',
    contact: '孙七',
    phone: '13900139002',
    address: '上海市徐汇区',
    bank: '建设银行上海分行',
    bankAccount: '6227000012345678901',
    taxNo: '913100007109291097',
    creditLimit: 1500000,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    _id: 'S003',
    code: 'S003',
    name: '广州供应商有限公司',
    contact: '周八',
    phone: '13900139003',
    address: '广州市越秀区',
    bank: '农业银行广州分行',
    bankAccount: '6228000012345678901',
    taxNo: '914401007109291097',
    creditLimit: 1000000,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

module.exports = {
  purchaseOrdersData,
  salesOrdersData,
  inventoryData,
  customersData,
  suppliersData
};