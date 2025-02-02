import { Router } from 'express'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'
import * as profilesCtrl from '../controllers/profiles.js'

const router = Router()

/*---------- Public Routes ----------*/


/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)
router.get('/', checkAuth, profilesCtrl.index)
router.get('/:profileId', checkAuth, profilesCtrl.show)
router.get('/:profileId/shelves', checkAuth, profilesCtrl.showShelves);

router.post('/:profileId/shelves', checkAuth, profilesCtrl.createShelf)
router.post('/:profileId/shelves/:shelfId/books/:volumeId', checkAuth, profilesCtrl.addBookToShelf)

router.put('/:id/add-photo', checkAuth, profilesCtrl.addPhoto)
router.put('/:profileId/shelves/:shelfId', checkAuth, profilesCtrl.editShelf)

router.delete('/:profileId/shelves/:shelfId', checkAuth, profilesCtrl.deleteShelf)

export { router }