import { Like, LikeableModel, LikesCollection } from '../common/common.js';
import './publications.js';

LikesCollection.allow({
    insert(userId, like) {
        // allow liking to occur if a user is logged in, the current user added the like, and they haven't already liked the object
        return userId && like.checkOwnership() && !like.isDuplicate();
    },
    remove(userId, like) {
        // allow unliking if there is a current user and the current user was the one who liked the object
        return userId && like.checkOwnership();
    },
});

LikesCollection.after.insert(function afterInsert(userId, like) {
    // after a successful like, increment the linked object's likeCount property
    const collection = this.transform().getCollectionForParentLink();
    userId && collection && collection.updateAsync({ _id: like.linkedObjectId }, { $inc: { likeCount: 1 } });
});

LikesCollection.after.remove(function afterRemove(userId, like) {
    // if the user unlikes an object, decrement the linked objects likeCount property
    const collection = this.transform().getCollectionForParentLink();
    userId && collection && collection.updateAsync({ _id: like.linkedObjectId }, { $inc: { likeCount: -1 } });
});

try {
    LikesCollection.createIndexAsync({ userId: 1 })
    LikesCollection.createIndexAsync({ userId: 1, linkedObjectId: 1 })
} catch (e) {
    console.debug('Failed to create indexes for the likes collection.')
}

export { Like, LikeableModel, LikesCollection };
