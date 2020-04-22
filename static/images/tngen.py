import cv2
import glob
import concurrent.futures

def thumbnail(params): 
    filename, N = params
    try:
        # Load just once, then successively scale down
        im = cv2.imread(filename)
        cv2.imwrite("compressed/mirrorlight_" + str(N) + ".jpg", im, [int(cv2.IMWRITE_JPEG_QUALITY), 40])
        # To preserve aspect ratio
        """scale_percent = 20 # percent of original size
        width = int(im.shape[1] * scale_percent / 100)
        height = int(im.shape[0] * scale_percent / 100)
        dim = (width, height)
        im = cv2.resize(im, dim, interpolation = cv2.INTER_AREA)"""

        # Same size
        im = cv2.resize(im, (200,200))
        
        cv2.imwrite("compressed/mirrorlight_" + str(N) + "_tn.jpg", im, [int(cv2.IMWRITE_JPEG_QUALITY), 90]) 

        """im = cv2.resize(im, (720,720))
        cv2.imwrite("t-%d-720.jpg" % N, im) 
        im = cv2.resize(im, (120,120))
        cv2.imwrite("t-%d-120.jpg" % N, im) """
        
        return 'OK'
    except Exception as e: 
        return e 


files = glob.glob('compressed/*.jpg')

executor = concurrent.futures.ThreadPoolExecutor(max_workers=3)

i = 1
for file in files:
    executor.submit(thumbnail, (file, i))
    i += 1