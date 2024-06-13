/* eslint-disable import/no-unresolved */
import SimpleSchema from 'meteor/aldeed:simple-schema';
/* eslint-enable import/no-unresolved */


export default ({ Meteor, LinkParent, LikesCollection, Like }) => {
    /**
    * LikeableModel - a mixin providing Likeable behavior for a model
    */
    const LikeableModel = Base => class extends Base { //eslint-disable-line
        constructor(document) {
            super(document);
            if (!(this instanceof LinkParent)) {
                throw new Meteor.Error('MustExtendParentLink', 'LikeableModel must extend ParentLink from socialize:linkable-model');
            }
        }

        /**
        * Add a record to the likes collection which is linked to the model
        */
        like() {
            if (Meteor.isServer) {
                this.likeAsync()
            }
            new Like(this.getLinkObject()).save();
        }
        async likeAsync() {
            new Like(this.getLinkObject()).saveAsync();
        }

        /**
        * Remove a record from the likes collection that is linked to the model
        */
        unlike() {
            if (Meteor.isServer) {
                return this.unlikeAsync()
            }
            // find and then call call instance.remove() since client
            // is restricted to removing items by their _id
            const like = LikesCollection.findOne({ userId: Meteor.userId(), linkedObjectId: this._id });
            like && like.remove();
        }
        async unlikeAsync() {
            // find and then call call instance.remove() since client
            // is restricted to removing items by their _id
            const like = await LikesCollection.findOneAsync({ userId: Meteor.userId(), linkedObjectId: this._id });
            like && like.remove();
        }

        /**
        * Get all the likes for the model
        * @returns {Mongo.Cursor} A mongo cursor which returns Like instances
        */
        likes(options = {}) {
            return LikesCollection.find({ linkedObjectId: this._id }, options);
        }

        /**
        * Get the like by a particular user for the model
        * @param   {User|Object|String}  user A User instance, Object with _id field or a String
        *                                     of the userId to check against
        * @returns {Mongo.Cursor} A mongo cursor which returns Like instances
        */
        likesBy(user) {
            const userId = user?._id || user;
            return LikesCollection.find({ userId, linkedObjectId: this._id }, { limit: 1 });
        }

        /**
        * Check if the model is liked by a certain user
        * @param   {User|Object|String}  user A User instance, Object with _id field or a String
        *                                     of the userId to check against
        * @returns {Boolean} Wheter the user likes the model or not
        */
        isLikedBy(user) {
            if (Meteor.isServer) {
                return this.isLikedByAsync(user)
            }
            const userId = user?._id || user;
            const like = LikesCollection.findOne({ linkedObjectId: this._id, userId });
            return !!like
        }
        async isLikedByAsync(user) {
            const userId = user?._id || user;
            const like = await LikesCollection.findOneAsync({ linkedObjectId: this._id, userId });
            return !!like
        }
    };


    // a schema which can be attached to other likeable types
    // if you extend a model with LikeableModel you will need to
    // attach this schema to it's collection as well.
    LikeableModel.LikeableSchema = new SimpleSchema({
        likeCount: {
            type: Number,
            defaultValue: 0,
            custom: SimpleSchema.denyUntrusted,
        },
    });

    return { LikeableModel };
};
