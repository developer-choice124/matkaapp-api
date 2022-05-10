export const API_V1:string = "/api/v1/";
export const BYTES:number = 16;
export const ITERATION:number = 1000;
export const KEY_LENGTH:number= 64;
export const DIGEST:string = "sha512";
export const OPERATORID:number = 29;
export const SECRETKEY:string = "b2295cf0-2337-4112-96f2-b6e10451d588";
export const ROLES: string[] = ["supermaster","master","user","admin"];

export const single = ['0','1','2','3','4','5','6','7','8','9'];
export const singlepatti = ['127','136','145','190','235','280','370','389','460','479','569','578','128','137','146','236','245','290','380','470','489','560','579','678','129','138','147','156','237','246','345','390','480','570','589','679','120','139','148','157','238','247','256','346','490','580','670','689','130','149','158','167','239','248','257','347','356','590','680','789','140','159','168','230','249','258','267','348','357','456','690','780','123','150','169','178','240','259','268','349','358','367','457','790','124','160','278','179','250','269','340','359','368','458','467','890','125','134','170','189','260','279','350','369','468','378','459','567','126','135','180','234','270','289','360','379','450','469','478','568'];
export const doublepatti = ['118','226','244','299','334','488','550','556','668','677','100','880','119','155','227','335','344','399','588','669','110','200','228','255','336','499','660','688','778','166','229','300','337','355','445','599','779','788','112','220','266','338','400','446','455','699','770','113','122','177','339','899','366','447','500','799','889','600','114','277','330','448','466','115','133','188','223','377','449','557','566','700','116','224','233','288','440','477','558','800','990','117','144','199','225','388','559','577','667','900'];
export const tripalpatti = ['111','222','333','444','555','666','777','888','000','999'];
export const jodi = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99'];

// Http response
export const RFC = {
    // OK
    H200 : 200,
    // Created
    H201 : 201,
    // Not Found
    H401 : 401,
    // Not Found
    H400 : 400,
    // Invelid argument
    H404 : 404,
    // Forbidden
    H403 : 403,
    // Conflict
    H409 : 409,
    // Precondition Failed
    H412 : 412,
    // Unsupported media type
    H415 : 415,
    // Internal Server Error
    H500 : 500,

}

// Success Messages
export const USER_CREATED = "User created successfully!";
export const USER_UPDATED = "User updation successfully!";
export const LOGIN_SUCCESS = "Logged in successfully!";

// Errors Messages
export const VALIDATION_ERROR = "Validation error!";
export const INTERNAL_ERROR = "Internal server error!";
export const UNAUTHORIZED_ACCESS = "Unauthorized access!";
export const JWT_NOT_FOUND = "JWT token not found!";
export const INVALID_USER = "Invalid username or password!";

// Validation Messages
export const IS_EXISTS = "already exists!";
export const USER_EXISTS = "User already exists!";

// Lottery Market Messages
export const LOTTERY_LIST = "Lottery list!";
export const LOTTERY_CREATED = "Lottery created successfully!";
export const LOTTERY_FAILED = "Lottery creation failed!";
export const LOTTERY_UPDATED = "Lottery updated successfully!";
export const LOTTERY_DELETED = "Lottery deleted successfully!";

// chart Messages
export const CHART_CREATED = "Chart created successfully!";
export const CHART_FAILED = "Chart creation failed!";

// Lottery Type Messages
export const LOTTERY_TYPE_CREATED = "Lottery type created successfully!";
export const LOTTERY_TYPE_UPDATED = "Lottery type updated successfully!";
export const LOTTERY_TYPE_LIST = "Lottery type list!";

// Bet Messages
export const BET_NOT_ALLOWED = "Bet not allowed to this user!";

// Successfull listing Messages
export const COMMON_SUCCESS = "successfully executed!";

// Exception
export const EXCEPTION_MSG = "Exception!";

// Chip Transection Messages
export const TRANSECTION_FAILED = "Transection Failed!";
export const TRANSECTION_SUCCESS = "Transection successfully!";