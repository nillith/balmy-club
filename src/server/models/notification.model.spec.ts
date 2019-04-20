import {NotificationModel} from "./notification.model";

const broadcastParams = {
  recipientIds: [1, 2, 3, 4, 5],
  activityId: 3323,
  timestamp: 1555753966,
};


describe('NotificationModel', () => {

  it('should return false for invalid password', () => {
    (async function() {
      const {affectedRows, insertId} = await NotificationModel.broadcastInsert(broadcastParams);
    })();
  });
});
