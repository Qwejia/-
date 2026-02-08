// 生产制造模拟数据

// 生产计划数据
const productionPlansData = [
  {
    _id: 'PP001',
    planNumber: 'PP2026010001',
    productId: 'P001',
    productName: '笔记本电脑',
    quantity: 100,
    startDate: '2026-01-01',
    endDate: '2026-01-10',
    status: 'completed',
    createdAt: '2025-12-25T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    _id: 'PP002',
    planNumber: 'PP2026010002',
    productId: 'P002',
    productName: '打印机',
    quantity: 50,
    startDate: '2026-01-05',
    endDate: '2026-01-15',
    status: 'inProgress',
    createdAt: '2025-12-26T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z'
  },
  {
    _id: 'PP003',
    planNumber: 'PP2026010003',
    productId: 'P003',
    productName: '办公桌椅',
    quantity: 20,
    startDate: '2026-01-10',
    endDate: '2026-01-20',
    status: 'pending',
    createdAt: '2025-12-27T00:00:00Z',
    updatedAt: '2025-12-27T00:00:00Z'
  }
];

// 车间管理数据
const workshopOrdersData = [
  {
    _id: 'WO001',
    orderNumber: 'WO2026010001',
    planId: 'PP001',
    productId: 'P001',
    productName: '笔记本电脑',
    quantity: 100,
    workshopId: 'WS001',
    workshopName: '组装车间',
    startDate: '2026-01-01',
    endDate: '2026-01-10',
    completedQuantity: 100,
    status: 'completed',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    _id: 'WO002',
    orderNumber: 'WO2026010002',
    planId: 'PP002',
    productId: 'P002',
    productName: '打印机',
    quantity: 50,
    workshopId: 'WS002',
    workshopName: '电子车间',
    startDate: '2026-01-05',
    endDate: '2026-01-15',
    completedQuantity: 25,
    status: 'inProgress',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  }
];

// 物料清单数据
const billOfMaterialsData = [
  {
    _id: 'BOM001',
    bomNumber: 'BOM2026010001',
    productId: 'P001',
    productName: '笔记本电脑',
    items: [
      {
        materialId: 'M001',
        materialName: 'CPU',
        spec: 'Intel i7',
        quantity: 1,
        unit: '个'
      },
      {
        materialId: 'M002',
        materialName: '内存',
        spec: '16GB DDR4',
        quantity: 1,
        unit: '条'
      },
      {
        materialId: 'M003',
        materialName: '硬盘',
        spec: '512GB SSD',
        quantity: 1,
        unit: '个'
      },
      {
        materialId: 'M004',
        materialName: '显示屏',
        spec: '14英寸',
        quantity: 1,
        unit: '个'
      }
    ],
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    _id: 'BOM002',
    bomNumber: 'BOM2026010002',
    productId: 'P002',
    productName: '打印机',
    items: [
      {
        materialId: 'M005',
        materialName: '打印头',
        spec: 'HP 123',
        quantity: 1,
        unit: '个'
      },
      {
        materialId: 'M006',
        materialName: '硒鼓',
        spec: 'HP CE285A',
        quantity: 1,
        unit: '个'
      },
      {
        materialId: 'M007',
        materialName: '外壳',
        spec: 'ABS塑料',
        quantity: 1,
        unit: '个'
      }
    ],
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

// 物料数据
const materialsData = [
  {
    _id: 'M001',
    materialId: 'M001',
    name: 'CPU',
    spec: 'Intel i7',
    unit: '个',
    category: '电子元器件',
    price: 3000,
    stock: 500,
    minStock: 50,
    maxStock: 1000,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    _id: 'M002',
    materialId: 'M002',
    name: '内存',
    spec: '16GB DDR4',
    unit: '条',
    category: '电子元器件',
    price: 500,
    stock: 1000,
    minStock: 100,
    maxStock: 2000,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    _id: 'M003',
    materialId: 'M003',
    name: '硬盘',
    spec: '512GB SSD',
    unit: '个',
    category: '存储设备',
    price: 800,
    stock: 800,
    minStock: 80,
    maxStock: 1600,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    _id: 'M004',
    materialId: 'M004',
    name: '显示屏',
    spec: '14英寸',
    unit: '个',
    category: '显示设备',
    price: 1200,
    stock: 600,
    minStock: 60,
    maxStock: 1200,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    _id: 'M005',
    materialId: 'M005',
    name: '打印头',
    spec: 'HP 123',
    unit: '个',
    category: '打印设备',
    price: 200,
    stock: 300,
    minStock: 30,
    maxStock: 600,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

// 车间数据
const workshopsData = [
  {
    _id: 'WS001',
    workshopId: 'WS001',
    name: '组装车间',
    managerId: 'E004',
    managerName: '赵六',
    description: '负责产品组装和测试',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    _id: 'WS002',
    workshopId: 'WS002',
    name: '电子车间',
    managerId: 'E004',
    managerName: '赵六',
    description: '负责电子元器件加工和焊接',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

module.exports = {
  productionPlansData,
  workshopOrdersData,
  billOfMaterialsData,
  materialsData,
  workshopsData
};