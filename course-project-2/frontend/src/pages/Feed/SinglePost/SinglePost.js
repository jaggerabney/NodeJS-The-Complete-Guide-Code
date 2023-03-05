import React, { Component } from "react";

import Image from "../../../components/Image/Image";
import "./SinglePost.css";

class SinglePost extends Component {
  state = {
    title: "",
    author: "",
    date: "",
    image: "",
    content: "",
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;

    const graphqlQuery = {
      query: `
        {
          getPost(postId: "${postId}") {
            title
            content
            imageUrl
            creator {
              name
            }
            createdAt
          }
        }
      `,
    };

    fetch(`http://localhost:8080/graphql`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.props.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => res.json())
      .then((resData) => {
        console.log("resData: ", resData);

        if (resData.errors && resData.errors[0].status === 422) {
          throw new Error("Validation failed!");
        }

        if (resData.errors) {
          console.log("Error!");
          throw new Error("Could not authenticate you!");
        }

        this.setState({
          title: resData.data.getPost.title,
          author: resData.data.getPost.creator.name,
          image: `http://localhost:8080/` + resData.data.getPost.imageUrl,
          date: new Date(resData.data.getPost.createdAt).toLocaleDateString(
            "en-US"
          ),
          content: resData.data.getPost.content,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
