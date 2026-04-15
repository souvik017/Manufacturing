export const APIEndpoints = {
  logIn: "/auth/login",

  getProducts: "/product/list",

getProductTypes: "/product/type/list",
createProductType: "/product/type/add",
updateProductType: "/product/type/update",
deleteProductType: "/product/type/delete",

getProductCategories: "/product/category/list",
createProductCategory: "/product/category/add",
updateProductCategory: "/product/category/update",
deleteProductCategory: "/product/category/delete",

  createProduct: "/product/add",
  updateProduct: "/product/update",    
  deleteProduct: "/product/delete", 
  bulkUploadProducts:'/product/upload', 

  getHsns: "/hsn/list",
  createHsn: "/hsn/add",
  updateHsn: "/hsn/update",
  deleteHsn: "/hsn/delete",  
  
  getBoms: "/bom/list",
  createBom: "/bom/add",
  updateBom: "/bom/update",
  deleteBom: "/bom/delete",

  getOrders:"/mrn/list",
  createOrder:"/mrn/create",
  getOrderById:"/mrn/view",

  getPartners:"/partner/list",
  deletePartner:'/partner/delete',
  updatePartner:'/partner/update',
  createPartner: '/partner/add',

  getProjects:"/project/list",
  createProject:'/project/add',
  updateProject:'/project/update',
  deleteProject:'/project/delete',

  getManufactures:'/manufacturer/list',
  createManufacture:'/manufacturer/add',
  updateManufacture:'/manufacturer/update',
  deleteManufacture:'/manufacturer/delete',

  getUomCategories:'/uom/list',
  createUomCategory:'/uom/add',
  updateUomCategory:'/uom/update',
  deleteUomCategory:'/uom/delete',
};

