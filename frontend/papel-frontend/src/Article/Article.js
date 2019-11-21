import React from 'react';
import {Editor, EditorState, RichUtils} from 'draft-js';
import 'draft-js/dist/Draft.css';
import './Article.css';
import {useParams} from 'react-router-dom';
import $ from 'jquery';
import {Row, Col, Button, Card, Form} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faPlus,faThumbsUp,faThumbsDown, faUserCircle} from '@fortawesome/free-solid-svg-icons';
import CommentPreview from './CommentPreview';

class Article extends React.Component {
  constructor(props) {
    super(props);
    this.state = {id: this.props.match.params.id, article: {}, articleLoading: true, authorLoading: true, author: {}};
    this._article={};
    this._article_vote_type=0;
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {
    const self = this;
    const request_url = "http://ec2-18-197-152-183.eu-central-1.compute.amazonaws.com:3000/article/" + this.state.id;
    this.setState({articleLoading: true});
    $.get(request_url, data => {
      this.setState({articleLoading: false, article: data, authorLoading: true});
      const request_url = "http://ec2-18-197-152-183.eu-central-1.compute.amazonaws.com:3000/user/" + data.authorId;
      $.get(request_url, user => {this.setState( {author: user, authorLoading: false} ) } );
      this._article=this.state.article;
      }
    )
  }
  printID(id) {
    alert(id);
  }

  /*this.setState({article:{ voteCount:voteCount+1, title:article.title}})*/
  handleSubmit(event) {
    if(this._article_vote_type==1){
      this.setState({
        article: {
          ...this.state.article,
          voteCount: this.state.article ? this.state.article.voteCount + 1 : 0,
        }
      });
    }
    if(this._article_vote_type==2){
      this.setState({
        article: {
          ...this.state.article,
          voteCount: this.state.article ? this.state.article.voteCount - 1 : 0,
        }
      });
    }
  }
  render() {
    var article = this.state.article;
    var author = this.state.author;
    var authorLine;
    var voteCount = this.state.article.voteCount;
    var comments = this.state.article.comments;
    if (this.state.authorLoading)
      authorLine = <p style={{color: "gray"}}>author not found</p> ;
    else
      authorLine = <p style={{color: "gray"}}>by {author.name} {author.surname}</p> ;
    return (
      <Row className="article">
        <Col sm={{span: 10, offset: 1}} xs={{span: 12}} style={{marginBottom: 20}}>
          <Card>
            <Card.Body>
              <Card.Title><h1>{article.title}</h1></Card.Title>
                <a href="http://localhost:3000">{authorLine}</a>
              <hr />
              <Card.Text>{article.body}</Card.Text>
            </Card.Body>
            <hr/>
            <Row className="" >
                <Col sm={{span: 4, offset: 1}} xs={{span: 12}} style={{marginBottom: 20}}>
                 </Col>

                 <Col sm={{span: 2, offset: 0}} xs={{span: 12}} style={{marginBottom: 20}}>
                     &#8593;
                     {this.state.article.voteCount}
                 </Col>

                <Col sm={{span: 2, offset: 0}} xs={{span: 12}} style={{marginBottom: 20}}>
                    <Button size="sm"  onClick={() => {this._article_vote_type=1; this.handleSubmit();}}>
                      <FontAwesomeIcon name="Like" icon={faThumbsUp} />&nbsp;
                    </Button>
                </Col>

                <Col sm={{span: 2, offset: 0}} xs={{span: 12}} style={{marginBottom: 20}}>
                    <Button size="sm"  onClick={() => {this._article_vote_type=2; this.handleSubmit();} }>
                      <FontAwesomeIcon name="Dislike" icon={faThumbsDown} />&nbsp;
                  </Button>
                </Col>

              </Row>

          </Card>

        </Col>

        <Col sm={{span: 10, offset: 1}} xs={{span: 12}} style={{marginBottom: 20}}>
          <label for="commentEditor">You can share your opinion</label>
          <Form>
            <textarea class="form-control" id="commentEditor" rows="4"></textarea>

            <Col  md={{span: 2, offset: 10}}
                style={{width: "20", marginTop: 5, marginBottom: 10 }}>
                <Button size="sm" type="submit" onClick={() => {article="deneme"}}>
                  <FontAwesomeIcon icon={faPlus} />&nbsp; Add
                </Button>
            </Col>
          </Form>
        </Col>

        <Col sm={{span: 10, offset: 1}} xs={{span: 12}} style={{marginBottom: 20}}>
          
          <Card>
            <Card.Body>
              <Card.Title><h4>Comments</h4></Card.Title>

              { comments ? comments.map(article => (
                <CommentPreview key={comments._id} id={comments._id} author={comments.authorId} body={comments.body} date={comments.date} lastEditDate={comments.lastEditDate}  />
              )) : "Comments are loading" }  
                <hr />

              <Card.Title >
                <h6><FontAwesomeIcon name="Like" icon={faUserCircle} />&nbsp; {comments ? comments[0].author[0].name+" "+comments[0].author[0].surname : "Comments are loading..."}</h6>
              </Card.Title>
              
              <Card.Text >
                {comments ? comments[0].body : "Comments are loading..."}
              </Card.Text>
              
              <Row className="">

                <Col sm={{span: 2, offset: 0}} xs={{span: 12}}>
                  
                  <Button size="sm"  onClick={() => alert("impelement et")}>
                    
                    <FontAwesomeIcon name="Like" icon={faThumbsUp} />&nbsp;
                    !15!
                  </Button>

                </Col>

                <Col sm={{span: 2, offset: 0}} xs={{span: 12}}>
                  
                  <Button size="sm"  onClick={() => alert("implement et")}>
                    <FontAwesomeIcon name="Dislike" icon={faThumbsDown} />&nbsp;        
                    !5!
                  </Button>
                </Col>
              </Row>    
            </Card.Body>
          </Card>
        </Col>
      </Row >
    );
  }
}
export default Article;
