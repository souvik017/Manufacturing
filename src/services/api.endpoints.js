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
  reqProduct: "/product/reqproduct",
  updateOrder:'/mrn/update',

  getPartners:"/partner/list",
  deletePartner:'/partner/delete',
  updatePartner:'/partner/update',
  createPartner: '/partner/add',
  bulkUploadPartners:'/partner/upload',

  getProjects:"/project/list",
  createProject:'/project/add',
  updateProject:'/project/update',
  deleteProject:'/project/delete',
  bulkUploadProjects:'/project/upload',

  getManufactures:'/manufacturer/list',
  createManufacture:'/manufacturer/add',
  updateManufacture:'/manufacturer/update',
  deleteManufacture:'/manufacturer/delete',
  bulkUploadManufactures:'/manufacturer/upload',

  getUomCategories:'/uom/list',
  createUomCategory:'/uom/add',
  updateUomCategory:'/uom/update',
  deleteUomCategory:'/uom/delete',

   getUsers: "/auth/list",            // POST - {} returns array of users
  addUser: "/auth/add",              // POST - { emp_id, user_login_id, password, name, user_type }
  updateUser: "/auth/update",        // POST - { user_id, user_login_id, name, password, status }
  updateUserStatus: "/auth/update_status", // POST - { user_id, status }
  deleteUser: "/auth/delete",        // POST - { user_id }
  resetPassword: "/auth/reset", 
};

