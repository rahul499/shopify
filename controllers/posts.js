
const { findByIdAndDelete } = require('../models/post');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
const Post = require('../models/post');
const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'rahul499',
    api_key: '435681342787649',
    api_secret: process.env.CLOUDINARY_SECRET
});


module.exports = {
    //Posts Index
    async getPosts(req, res, next) {
        let posts = await Post.find({});
        res.render('posts/index', { posts, title: 'Post Index' });
    },
    
    //Posts New
    newPost(req, res, next) {
        res.render('posts/new', { title: 'New Post'});
    },

    // Posts create
    async createPost(req, res, next) {
        req.body.post.images = [];
       for(let item of req.files) {
           let image = await cloudinary.v2.uploader.upload(item.path);
           req.body.post.images.push({
               url: image.secure_url,
               public_id: image.public_id
           })
        }
        let response = await geocodingClient
		  .forwardGeocode({
		    query: req.body.post.location,
		    limit: 1
		  })
		  .send();
       req.body.post.coordinates = response.body.features[0].geometry.coordinates;
       let post = await Post.create(req.body.post);
       req.session.success = 'Post created Successfully';
       res.redirect(`/posts/${post.id}`);
    },

    //Posts show
    async showPost(req, res, next) {
        let post = await Post.findById(req.params.id).populate({
            path:'reviews',
            options: { sort: { '_id': -1 } },
            populate: {
                path: 'author',
                model: 'User'
            }
        });
        const floorRating = post.calculateAvgRating();
        let mapBoxToken = process.env.MAPBOX_TOKEN;
        res.render('posts/show', { post, mapBoxToken, floorRating });
    },

    //Get Edit
    async editPost(req, res, next) {
        let post = await Post.findById(req.params.id);
        res.render('posts/edit', { post });
    },

    //update post
    async updatePost(req, res, next) {
     //find post by id
     let post = await Post.findById(req.params.id);
     //check if thre's any images for deletion
     if(req.body.deleteImages && req.body.deleteImages.length) {
         //assign deleteImages from req.body to it's own variable
         let deleteImages = req.body.deleteImages;
         //loop over deleteImages
         for(const public_id of deleteImages){
           //delete images from cloudinary
           await cloudinary.v2.uploader.destroy(public_id);
           //delete image from post.images
           for(const image of post.images) {
             if(image.public_id === public_id){
                 let index = post.images.indexOf(image);
                 post.images.splice(index,1);
             }
           }
         } 
       }
    // check if there is new files for upload
    if(req.files) {
        for(let item of req.files) {
            //upload images
            let image = await cloudinary.v2.uploader.upload(item.path);
            //add images to post.images array
            post.images.push({
                url: image.secure_url,
                public_id: image.public_id
            });
         }
    }
    
    //check if location was updated
    if(req.body.post.location !== post.location) {
        let response = await geocodingClient
		  .forwardGeocode({
		    query: req.body.post.location,
		    limit: 1
		})
		.send();
      post.coordinates = response.body.features[0].geometry.coordinates;
      post.location = req.body.post.location;
    }
    
    //update the new post with any new properties
    post.title = req.body.post.title;
    post.description = req.body.post.description;
    post.price = req.body.post.price;
    
    //save updated post to db
    post.save();
    //redrect to show page
    res.redirect(`/posts/${post.id}`);


    },

    //delete posts
    async deletePost(req, res, next) {
        let post = await Post.findById(req.params.id);
        for(const image of post.images) {
            await cloudinary.v2.uploader.destroy(image.public_id);
        }
        await post.remove();
        req.session.success = 'Post deleted successfully!';
        res.redirect(`/posts`)
    }
}