import React from 'react';
import './Article.css';
import {instanceOf} from 'prop-types'
import {withCookies, Cookies} from 'react-cookie';
import {app_config} from "../config";
import {Row, Col, Button, Card, Form, FormGroup} from 'react-bootstrap';

import {postRequest} from '../helpers/request';

class AddArticle extends React.Component {
  static propTypes = {cookies: instanceOf(Cookies).isRequired};
  constructor(props) {
    super(props);
    const {cookies} = props;
    const loggedIn = !!cookies.get('userToken');
    var userId ="";
    if(loggedIn) {
     userId = cookies.get('user')._id?cookies.get('user')._id:"check get user id";
    }
    else {console.log("not logged");} 
    this.state = {loggedIn: loggedIn, userId:userId, title:"", body:"", imgURL:""};
    
    
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {
    const {cookies} = this.props;
      
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) { 
   const {cookies} = this.props;
    console.log(cookies.get('userToken'));
    var article = {title:this.state.title, imgUri:this.state.imgURL, body : this.state.body};
    console.log(article)
    if(!this.state.loggedIn){
      alert("please log in")
    }else{
      event.preventDefault();
      postRequest({
        url: app_config.api_url + "/article/",
        data: article,
        success: function() { window.location.replace("./profile")},
        authToken: cookies.get('userToken')
      })
    }
  }
 
  render() {
    
    return (
      <Row className="article">

      
        <Col sm={{span: 10, offset: 1}} xs={{span: 12}} style={{marginBottom: 20}}>
        <Form onSubmit={()=>this.handleSubmit}>
        <Form.Group controlId="exampleForm.ControlTextarea1">
            <Form.Label>Add a title for your article :</Form.Label>
            <Form.Control as="textarea" rows="3" 
                        name="title"
                        placeholder="Title..."
                        onChange={this.handleChange} 
                        rows="1"
                        style={{
                          height:45,
                          maxHeight:90,
                          fontSize:20,
                          fontWeight:"bold"
                        }}>
            </Form.Control>
          </Form.Group>
          
          <Form.Group controlId="exampleForm.ControlTextarea1">
            <Form.Label>You can add image URL :</Form.Label>
            <Form.Control as="textarea" rows="3" 
                        name="imgURL"
                        placeholder="URL..."
                        onChange={this.handleChange} 
                        rows="1"
                        style={{
                          height:45,
                          maxHeight:90,
                          fontSize:20
                        }}>
            </Form.Control>
          </Form.Group>
          

          <Form.Group controlId="exampleForm.ControlTextarea1">
            <Form.Label>You can write your article :</Form.Label>
            <Form.Control as="textarea" rows="3"
                          name="body"
                          placeholder="Text..."
                          onChange={this.handleChange}
                          style={{
                            height:400,
                            maxHeight:800,
                            fontSize:18
                          }}>

            </Form.Control>
          </Form.Group>
          
          <Button variant="primary"  onClick={this.handleSubmit}>
            Submit
          </Button>
        </Form>

        </Col>

      </Row >
    );
  }
}
export default withCookies(AddArticle);
