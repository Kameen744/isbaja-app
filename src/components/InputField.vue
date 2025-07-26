<script setup>
// Define props
const props = defineProps({
  modelValue: "",
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    defualt: "text",
  },
  col: {
    default: 4,
  },
});

const emit = defineEmits(["update:modelValue"]);
const onInput = (event) => {
  emit("update:modelValue", event.target.value);
};
</script>

<template>
  <div class="col-12" :class="`col-lg-${col} col-sm-${col}`">
    <div class="form-group">
      <label>{{ label }}</label>
      <input
        class="form-control"
        :type="type"
        :placeholder="label"
        :value="modelValue"
        @input="onInput"
      />
    </div>
  </div>
</template>
