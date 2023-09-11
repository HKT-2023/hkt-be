export enum ActivityMessageSuccess {
  GetListActivity = "Activity list retrieved successfully.",
  GetDetailActivity = "Activity details retrieved successfully.",
  ActivityCreated = "Activity created successfully.",
  ActivityDeleted = "Activity deleted successfully.",
}

export enum ActivityMessageError {
  CreateFailed = "Activity creation failed.",
  DeleteFailed = "Activity deletion failed.",
  GetDetailFailed = "Get detail failed",
}

export enum ActivityQueue {
  TransactionFeeUpdate = "TransactionFeeUpdate",
}
