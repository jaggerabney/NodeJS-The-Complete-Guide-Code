exports.getPosts = function (req, res, next) {
  res.status(200).json({
    posts: [
      {
        _id: new Date().getTime(),
        title: "First post",
        content: "This is the first post!",
        imageUrl: "images/cat.jpg",
        creator: {
          name: "Jagger",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = function (req, res, next) {
  const { title, content } = req.body;

  // Create post in db
  res.status(201).json({
    message: "Post created successfully!",
    post: {
      id: new Date().toISOString(),
      title,
      content,
    },
  });
};
