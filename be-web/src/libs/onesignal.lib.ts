import * as OneSignal from "@onesignal/node-onesignal";
import { ONE_SIGNAL_CONFIG } from "src/configs/onesignal.config";

const app_key_provider = {
  getToken() {
    return ONE_SIGNAL_CONFIG.onesignalAppKey;
  },
};

const user_key_provider = {
  getToken() {
    return ONE_SIGNAL_CONFIG.onesignalUserKey;
  },
};

const configuration = OneSignal.createConfiguration({
  authMethods: {
    user_key: {
      tokenProvider: user_key_provider,
    },
    app_key: {
      tokenProvider: app_key_provider,
    },
  },
});

export interface IOption {
  message?: string;
  headings?: string;
  appUrl?: string;
}

export const sendNotification = async (receiver: string, option: IOption) => {
  const notification = new OneSignal.Notification();
  notification.app_id = ONE_SIGNAL_CONFIG.onesignalAppId;
  const client = new OneSignal.DefaultApi(configuration);
  notification.contents = {
    en: option?.message ? option?.message : "",
  };

  notification.app_url = option?.appUrl ? option?.appUrl : "";
  notification.ios_badge_type = "Increase";
  notification.ios_badge_count = 1;

  // required for Huawei
  notification.headings = {
    en: option?.headings ? option?.headings : "",
  };

  if (receiver) {
    notification.include_external_user_ids = [receiver];
  } else {
    notification.included_segments = ["Subscribed Users"];
  }

  notification.channel_for_external_user_ids = "push";
  notification.name = "Notification";

  await client.createNotification(notification);
};
