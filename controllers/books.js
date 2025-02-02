import { Book } from "../models/book.js"
import { Profile } from "../models/profile.js"
import * as googleMiddleware from '../config/helpers.js'

export async function bookSearch(req, res) {
  try {
    const bookData = await googleMiddleware.fetchBooksMiddleware(req.body.searchTerm, req.body.startIndex)
    res.status(200).send(bookData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

export async function getBookDetails(req, res) {
  try {
    const bookDetails = await googleMiddleware.getBookDetailsByIdMiddleware(req.params.volumeId)

    if (bookDetails.error) {
      return res.status(404).json({ error: 'Book not found in the Google API' });
    }

    res.status(200).json(bookDetails);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}


export async function createComment(req, res) {
  try {
    console.log('reqUser:',req.user)
    console.log('reqBODY:',req.body)
    req.body.commenter = req.user.profile

    const bookDetails = await googleMiddleware.getBookDetailsByIdMiddleware(req.params.volumeId)

    if (!bookDetails) {
      return res.status(404).json({ error: 'Book not found in the Google API' });
    }

    const { text, rating } = req.body

    const newComment = {
      text,
      commenter: req.user.profile,
      rating: rating || 5
    };

    const existingBook = await Book.findOne({ googleId: bookDetails.googleId })

    if (existingBook) {
      existingBook.comments.push(newComment);
      await existingBook.save();
    } else {
      const newBook = new Book({
        title: bookDetails.title ? bookDetails.title : '',
        subtitle: bookDetails.subtitle ? bookDetails.subtitle : '',
        authors : bookDetails.authors ? bookDetails.authors : [],
        cover: bookDetails.cover ? bookDetails.cover : '',
        published: bookDetails.published ? bookDetails.published : '',
        description: bookDetails.description ? bookDetails.description : '',
        pages: bookDetails.pages ? bookDetails.pages : 0,
        categories: bookDetails.categories ? bookDetails.categories : [],
        url: bookDetails.url ? bookDetails.url : '',
        googleId: bookDetails.googleId,
        comments: [newComment]
      })

      newBook.comments.push(newComment)
      await newBook.save();
    }
    console.log('BOOKDETAILS:',bookDetails)
    console.log('comment', newComment)
    
    res.status(201).json(newComment);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

export async function getComments(req, res){
  try {
    const { volumeId } = req.params;
    
    const book = await Book.findOne({ googleId: volumeId })
    .populate('comments.commenter')

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const comments = book.comments
    res.status(200).json(comments)
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

export const updateComment = async (req, res) => {
  try {
    console.log('REQBODY:', req.body)
    const {volumeId, commentId} = req.params
    console.log('volumeId:', req.params.volumeId);
    console.log('commentId:', req.params.commentId);  
    const book = await Book.findOne({ googleId: volumeId });

    console.log('volumeId:', volumeId);
    console.log('commentId:', commentId);
    const comment = book.comments.id(commentId)
    console.log('comment:', comment);
    comment.text = req.body.text
    comment.rating = req.body.rating
    console.log('comment:', comment);
    await book.save()
    res.status(200).json
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

export const deleteComment = async (req, res) => {
  try {
    const { volumeId, commentId } = req.params
    const book = await Book.findOne({ googleId: volumeId })
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    //find the comment by its id
    const comment = book.comments.id(commentId)
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    book.comments.remove({_id: req.params.commentId})
    await book.save()

    res.status(200).json(book)
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}