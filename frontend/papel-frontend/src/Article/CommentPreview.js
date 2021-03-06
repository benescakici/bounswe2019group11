import React, { useState, useEffect } from 'react';
import {Row, Col, Button, Card, Form} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faPlus,faThumbsUp,faThumbsDown, faUserCircle, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import $ from 'jquery';
import {app_config} from "../config";
import Article from './Article';
import { useCookies} from 'react-cookie';
import {deleteRequest,postRequest} from "../helpers/request"
function CommentPreview({id, authorId, articleId, author,   body, date, lastEditDate}) {
  const [cookies, setCookie, removeCookie] = useCookies(['userToken', 'user' ]);
  const [count, setCount] = useState(0);
  var deleteBtn;
  const loggedIn = !!cookies.userToken;
  useEffect(() => {
    // Update the document title using the browser API
    //if(count>0) window.location.reload();
  });

  function handleDelete(){

    var path = app_config.api_url+"/article/"+articleId+"/comment/"+id;
    deleteRequest({url:path, success:()=>{}, authToken:cookies.userToken })
    setCount(count+1);
  }
  if(loggedIn && (cookies.user._id == authorId)){
    deleteBtn = <Col sm={{span: 2, offset: 5}} xs={{span: 12}}>
      <FontAwesomeIcon id="interactive" name="Delete" onClick={handleDelete}

         icon={faTrashAlt}
      />
    </Col>
  }
  return (


      <Card.Body>

        <Card.Title id="interactive" >
          <h6><FontAwesomeIcon  name="UserCircle" icon={faUserCircle} />&nbsp; {author}</h6>
        </Card.Title>
        <Card.Text >
          {body ? body : "Comments are loading..."}
        </Card.Text>

        <Row className="">

          <Col sm={{span: 2, offset: 0}} xs={{span: 12}}>


          </Col>

          <Col sm={{span: 2, offset: 0}} xs={{span: 12}}>


          </Col>

          {deleteBtn}

        </Row>
        <hr/>
      </Card.Body>

  );
}
export default CommentPreview;
