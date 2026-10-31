package restaurant_management_be.services.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.dto.dishes.DishResponse;
import restaurant_management_be.common.specification.GenericSortBuilder;
import restaurant_management_be.common.specification.GenericSpecification;
import restaurant_management_be.dto.dishes.DishUpdateRequest;
import restaurant_management_be.dto.dishes.DishUpdateStatusRequest;
import restaurant_management_be.entities.Dish;
import restaurant_management_be.mapper.DishMapper;
import restaurant_management_be.repository.CategoryRepository;
import restaurant_management_be.repository.DishRepository;
import restaurant_management_be.services.DishService;
import org.springframework.data.domain.Page;
import restaurant_management_be.repository.CategoryRepository;
import org.springframework.data.domain.Pageable;
import restaurant_management_be.common.specification.SearchRequest;
import restaurant_management_be.dto.dishes.DishCreateRequest;
import restaurant_management_be.entities.Category;
import java.util.Set;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DishServiceImpl implements DishService {

    private final DishRepository dishRepository;
    private final DishMapper dishMapper;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DishResponse> getAllDishes() {
        return dishRepository.findAll()
                .stream()
                .map(dishMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DishResponse getDishById(Long id) {
        return dishRepository.findById(id)
                .map(dishMapper::toResponse)
                .orElseThrow(() -> new AppException(
                        ErrorCode.DISH_NOT_FOUND,
                        "Món ăn không tồn tại",
                        HttpStatus.NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DishResponse> searchDishes(SearchRequest request, Pageable pageable) {
        GenericSpecification<Dish> spec = new GenericSpecification<>(request.getFilters());
        Pageable sortedPageable = GenericSortBuilder.applySorts(request.getSorts(), pageable);
        return dishRepository.findAll(spec, sortedPageable)
                .map(dishMapper::toResponse);
    }
    @Transactional
    public DishResponse createDish(DishCreateRequest request) {
        if (dishRepository.existsByName(request.getName())) {
            throw new AppException(
                    ErrorCode.DISH_EXISTS,
                    "Món ăn đã tồn tại",
                    HttpStatus.CONFLICT);
        }
        Set<Category> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));
        if (categories.size() != request.getCategoryIds().stream().distinct().count()) {
            throw new AppException(
                    ErrorCode.CATEGORY_NOT_FOUND,
                    "Một hoặc nhiều danh mục không tồn tại",
                    HttpStatus.NOT_FOUND);
        }

        Dish dish = dishMapper.toEntity(request, categories);
        Dish savedDish = dishRepository.save(dish);
        return dishMapper.toResponse(savedDish);
    }

    @Override
    @Transactional
    public DishResponse updateDish(Long id, DishUpdateRequest request) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        ErrorCode.DISH_NOT_FOUND,
                        "Món ăn không tồn tại",
                        HttpStatus.NOT_FOUND));

        if (request.getName() != null && !request.getName().isBlank()) {
            String newName = request.getName().trim();
            if (!newName.equals(dish.getName())) {
                if (dishRepository.existsByNameAndIdNot(newName, dish.getId())) {
                    throw new AppException(
                            ErrorCode.DISH_EXISTS,
                            "Món ăn đã tồn tại",
                            HttpStatus.CONFLICT);
                }
                dish.setName(newName);
            }
        }

        if (request.getDescription() != null) {
            dish.setDescription(request.getDescription());
        }

        if (request.getImageUrl() != null) {
            dish.setImageUrl(request.getImageUrl());
        }

        if (request.getPrice() != null) {
            dish.setPrice(request.getPrice());
        }

        if (request.getCategoryIds() != null) {
            Set<Category> categories = new HashSet<>(
                    categoryRepository.findAllById(request.getCategoryIds()));
            if (categories.size() != request.getCategoryIds().stream().distinct().count()) {
                throw new AppException(
                        ErrorCode.CATEGORY_NOT_FOUND,
                        "Một hoặc nhiều danh mục không tồn tại",
                        HttpStatus.NOT_FOUND);
            }
            dish.setCategories(categories);
        }

        Dish updatedDish = dishRepository.save(dish);
        return dishMapper.toResponse(updatedDish);
    }

    @Override
    @Transactional
    public DishResponse updateDishStatus(Long id, DishUpdateStatusRequest request) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        ErrorCode.DISH_NOT_FOUND,
                        "Món ăn không tồn tại",
                        HttpStatus.NOT_FOUND));

        dish.setIsAvailable(request.getIsAvailable());
        Dish updatedDish = dishRepository.save(dish);
        return dishMapper.toResponse(updatedDish);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Dish> getDishesByIds(List<Long> ids) {
        List<Dish> dishes = dishRepository.findAllById(ids);
        if (dishes.size() != ids.size()) {
            throw new AppException(
                    ErrorCode.DISH_NOT_FOUND,
                    "Không tìm thấy món ăn",
                    HttpStatus.NOT_FOUND);
        }
        return dishes;
    }
}