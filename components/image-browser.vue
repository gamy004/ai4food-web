<script lang="ts" setup>
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";
import { ComputedRef, Ref } from "vue";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import CarbonImage from "~icons/carbon/image";
import CarbonCloseOutline from "~icons/carbon/close-outline";
import { ReadImageAsBase64Output } from "~~/composables/useFileReader";
import { UpsertFileData } from "~~/composables/useUpload";

export interface DisplayedImage {
    id?: string;
    parentId?: string;
    src: string;
    uploadedImage?: boolean;
    originalIndex?: number;
}

export interface Props {
    directory?: string;
    disabled?: boolean;
    settings?: object;
    itemsToShow?: number;
    modelValue?: DisplayedImage[];
}

// export interface Events {
//     (e: 'click'): void
// }

const props = withDefaults(
  defineProps<Props>(),
  {
    directory: "",
    disabled: false,
    settings: () => ({}),
    itemsToShow: 3,
    modelValue: () => []
  }
);

const emit = defineEmits(["update:modelValue"]);

const { uploadFile } = useUpload();
const { readImageAsBase64 } = useFileReader();
const reading = ref(false);
const uploading = ref(false);
const imageInput = ref(null);
const carouselRef = ref(null);
const currentSlide = ref(0);
const addedImages: Ref<ReadImageAsBase64Output[]> = ref([]);

const onBrowsed = () => {
  imageInput.value?.click();
};

const onImageAdded = async (event) => {
  if (event.target.files?.length) {
    reading.value = true;

    const fileOutput = await readImageAsBase64(event.target.files);

    reading.value = false;

    addedImages.value = [
      ...fileOutput,
      ...addedImages.value
    ];

    event.target.value = "";
  }
};

const currentDisplayedImage = computed(() => {
  let result = null;

  if (carouselRef.value) {
    result = displayedImages.value[currentSlide.value];
  }

  return result;
});

const hasPendingUploadImages = computed(() => addedImages.value.length > 0);

const displayedImages: ComputedRef<DisplayedImage[]> = computed(() => {
  const addedImageSrcs = addedImages.value.map(
    (image, index) => ({ src: image.dataURL as string, uploadedImage: true, originalIndex: index })
  );

  return [
    ...addedImageSrcs,
    ...props.modelValue
  ];
});

const upload = async (): Promise<UpsertFileData[]> => {
  let uploadResult: UpsertFileData[] = [];

  if (hasPendingUploadImages.value) {
    uploading.value = true;

    uploadResult = await Promise.all(
      addedImages.value.map(async (addedImage) => {
        const fileEntity = await uploadFile({
          file: addedImage.originalImage,
          uploadObject: addedImage.compressedImage,
          prefix: props.directory
        });

        return fileEntity;
      })
    );

    uploading.value = false;
  }

  return uploadResult;
};

const removeImageByIndex = (index) => {
  const targetImage = displayedImages.value[index];

  if (isPersistedImage(targetImage)) {
    const modelValue = props.modelValue;

    const targetIndex = modelValue.findIndex(record => record.id === targetImage.id);

    modelValue.splice(targetIndex, 1);

    emit("update:modelValue", modelValue);
  } else {
    const { originalIndex } = targetImage;

    addedImages.value.splice(originalIndex, 1);
  }

  const cachedCurrentSlide = currentSlide.value;

  carouselRef.value?.restartCarousel();

  currentSlide.value = cachedCurrentSlide;
};

const onClickSlide = (index) => {
  currentSlide.value = index;
};

const generateBackgroupStyle = src => ({
  backgroundImage: `url(${src})`,

  /* Background image is centered vertically and horizontally at all times */
  backgroundPosition: "center center",

  /* Background image doesn't tile */
  backgroundRepeat: "no-repeat",

  /* Background image is fixed in the viewport so that it doesn't move when
    the content's height is greater than the image's height */
  // backgroundAttachment: 'fixed',

  /* This is what makes the background image rescale based
    on the container's size */
  backgroundSize: "cover",

  /* Set a background color that will be displayed
    while the background image is loading */
  backgroundColor: "#464646"
});

const isPersistedImage = image => image.id !== undefined;

const showNavigation = computed(() => displayedImages.value.length > props.itemsToShow);

const itemsToScroll = computed(() => showNavigation.value ? 1 : 0);

defineExpose({
  hasPendingUploadImages,
  upload,
  removeImageByIndex
});
</script>

<template>
  <div class="container__image-browser">
    <b-row align-h="center" class="mt-3">
      <b-col>
        <b-img v-if="currentDisplayedImage" :src="currentDisplayedImage.src" fluid rounded class="w-100 mb-2" />

        <carousel
          v-if="displayedImages.length"
          ref="carouselRef"
          v-model="currentSlide"
          :items-to-show="props.itemsToShow"
          :items-to-scroll="itemsToScroll"
          snap-align="start"
        >
          <slide
            v-for="(image, index) in displayedImages"
            :key="`slide-${index}`"
            class="carousel__slide me-1"
          >
            <b-overlay :show="(image.uploadedImage && uploading)" class="w-100" variant="dark">
              <a href="javascript:void(0)" @click="onClickSlide(index)">
                <div class="w-100 carousel__item rounded" :style="generateBackgroupStyle(image.src)" />
              </a>

              <div class="d-grid mt-2">
                <b-button block variant="outline-danger" @click="removeImageByIndex(index)">
                  ลบ
                </b-button>
              </div>

              <template #overlay>
                <div
                  v-if="image.uploadedImage && uploading"
                  class="d-flex justify-content-center align-items-center"
                  style="width: 5em; height: 5em;"
                >
                  <line-md-loading-twotone-loop :style="{ fontSize: '5em', height: '10vh' }" />
                </div>
              </template>
            </b-overlay>
          </slide>

          <template #addons>
            <navigation v-if="showNavigation" />
            <pagination v-if="showNavigation" class="mb-0" />
          </template>
        </carousel>
      </b-col>
    </b-row>

    <b-row align-h="center" class="mt-3">
      <b-col class="container__swab-area-images">
        <b-overlay v-if="!displayedImages.length" show variant="dark" no-center>
          <b-card aria-hidden class="text-center">
            <b-card-text>
              <!-- <line-md-loading-twotone-loop v-if="reading || uploading"
                                :style="{ color: '#6c757d', fontSize: '5em', height: '20vh' }" /> -->

              <carbon-image :style="{ color: '#6c757d', fontSize: '6em', height: '12vh' }" />

              <!-- <p v-if="uploading">กำลังอัพโหลด...</p> -->
            </b-card-text>
          </b-card>

          <template #overlay>
            <div class="h-100 d-flex flex-column justify-content-end align-items-start ps-3 pb-3">
              <h5 id="attach-swab-area-image-label" class="fw-bold text-light" for="image">
                เพิ่มรูปภาพ
              </h5>

              <b-button
                aria-describedby="attach-swab-area-image-label"
                variant="light"
                class="border"
                :disabled="disabled || reading || uploading"
                @click="onBrowsed"
              >
                <b-overlay v-if="disabled || reading || uploading">
                  <line-md-loading-twotone-loop
                    v-if="reading || uploading"
                    :style="{ fontSize: '1.25em' }"
                  />
                </b-overlay>
                <span v-else>Browse</span>
              </b-button>
            </div>
          </template>
        </b-overlay>

        <b-button
          v-else
          aria-describedby="attach-swab-area-image-label"
          variant="light"
          class="border"
          :disabled="disabled || reading || uploading"
          @click="onBrowsed"
        >
          <b-overlay v-if="reading || uploading">
            <line-md-loading-twotone-loop :style="{ fontSize: '1.25em' }" />
          </b-overlay>

          <span v-else>Browse</span>
        </b-button>

        <input
          id="image"
          ref="imageInput"
          type="file"
          class="form-control"
          accept="image/*"
          hidden
          multiple
          @change="onImageAdded"
        >
      </b-col>
    </b-row>
  </div>
</template>

<style lang="scss">
.container__image-browser {
    .carousel__track {
        align-items: flex-start;
    }

    .carousel__slide {
        .carousel__item {
            width: 100%;
            height: 120px;
            max-height: 150px;
            transform: scale(1);
            opacity: 0.5;
            transition: 0.5s;
        }

        // &--visible {
        //     >.carousel__item {
        //         opacity: 1;
        //         // transform: rotateY(0);
        //     }
        // }

        // &--next {
        //     >.carousel__item {
        //         opacity: 0.8;
        //     }
        // }

        // &--prev {
        //     >.carousel__item {
        //         opacity: 0.8;
        //     }
        // }

        &--active {
            .carousel__item {
                opacity: 1;
            }
        }
    }
}
</style>
