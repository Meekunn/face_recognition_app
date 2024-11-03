import cv2
from ultralytics import YOLO
from deepface import DeepFace

# Load the YOLOv8 model
model = YOLO('best.pt')

# Open the video file
cap = cv2.VideoCapture('New_videos/IMG_9215.MOV')

# Check if the camera is opened successfully
if not cap.isOpened():
    print("Error: Could not open camera.")

frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
frame_rate = int(cap.get(cv2.CAP_PROP_FPS))

output_path = 'output.mp4'
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_path, fourcc, frame_rate, (frame_width, frame_height))

while True:
    # Capture frame-by-frame
    ret, frame = cap.read()
    plot_image = frame.copy()

    if not ret:
        print("Error: Could not read frame.")
        break

    # Display the captured frame
    # cv2.imshow('Camera', frame)

    # Run tracking on the current frame
    results = model.track(frame, persist=True,tracker="custom_botsort.yaml", save=True, conf=0.5)
    print(results[0].boxes)
    # annotated_frame = results[0].plot()
    # cv2.imshow("YOLOv8 Tracking", annotated_frame)

    # Check if tracking IDs are available
    if hasattr(results[0].boxes, 'id') and results[0].boxes.id is not None:
        boxes = results[0].boxes.xyxy.cpu().numpy().astype(int)
        ids = results[0].boxes.id.cpu().numpy().astype(int)
        cropped_images = []

        # Draw boxes and IDs on the frame
        for box, id in zip(boxes, ids):
            cv2.rectangle(plot_image, (box[0], box[1]), (box[2], box[3]), (0, 255, 0), 2)
            cv2.putText(plot_image, f"Id {id}", (box[0], box[1]), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

            # Crop the image using the bounding box
            cropped_image = frame[box[1]:box[3], box[0]:box[2]]
            cropped_images.append(cropped_image)
            result = DeepFace.verify(
                img1_path = cropped_image,
                img2_path = "cropped_faces/e9211d9d-2be9-482f-a17e-c5e9c057e52e_cropped_my_selfie.png",
                model_name = 'Facenet512',
                detector_backend = 'skip'
            )
            print(result)

            cv2.imshow('Cropped bound box', cropped_image)
            

    else:
        print("Tracking IDs not available.")

    out.write(plot_image)

    resized_frame = cv2.resize(plot_image, (int(frame_width/2), int(frame_height/2)), interpolation=cv2.INTER_LINEAR)

    # Display the annotated frame
    cv2.imshow("YOLOv10n Tracking", resized_frame)
    cv2.waitKey(0)

    # Break the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

    # Release the video capture object and close the display window
cap.release()
out.release()
cv2.destroyAllWindows()