"""utils for multiprocessing running nlp pipeline"""

from math import ceil
from multiprocessing import cpu_count


# if total_size is 1000 and seg_n is 3
# then segments size will be 334, 333, 333
# and result will be [(0, 334), (334, 667), (667, 1000)]
def split_by_segment_n(total_size:int, seg_n: int) -> list:

    """spilt total_size into seg_n segments"""

    # edge cases
    if (total_size <= 0) or (seg_n <= 0):
        return []

    if total_size <= seg_n:
        return [ (min(i, total_size), min(i+1, total_size)) for i in range (0, seg_n) ]

    # when total_size > seg_n
    res_list = []
    seg_size = total_size // seg_n
    remainder = total_size % seg_n

    for i in range (0, seg_n):

        head_offset = min(i, remainder)
        rear_offset = min(i+1, remainder)

        head_i = min(i*seg_size + head_offset, total_size)
        rear_i = min((i+1)*seg_size + rear_offset, total_size)

        res_list.append((head_i, rear_i))

    return res_list



# if total_size is 1000 and seg_size is 3
# then segments n will be 334
# and result will be [(0, 3), (3, 6), (6, 9), ... , (996, 999), (999, 1000)]
def split_by_segment_size(total_size:int, seg_size: int, offset: int = 0) -> list:

    """split total_size into segments by seg_size"""

    # edge cases
    if (total_size <= 0) or (seg_size <= 0):
        return []

    if total_size <= seg_size:
        return [(0+offset, total_size+offset)]

    # when total_size > batch_size
    res_list = []
    seg_n = ceil(total_size / seg_size)
    for i in range (0, seg_n):
        res_list.append((
            (i*seg_size) + offset,
            min((i+1)*seg_size, total_size) + offset
        ))

    return res_list


# depend on "split_by_segment_n" and "split_by_segment_size"
def generate_parallel_backlog_index_list(
        total_n: int, parallel_n: int, batch_size: int, offset: int, limit: int
) -> list:

    """
    split total_n by parallel_n using "split_by_segment_n"
    and then further split result by batch_size using "split_by_segment_size"
    """

    # limit parallel_n by cpu_count
    processes_n = min(cpu_count(), parallel_n)

    # apply limit and shift offset
    # total_head, total_rear = min(total_n, max(0, offset)), min(total_n, head+max(0, limit))
    total_head = offset
    total_rear = min(total_n, total_head+limit)
    if (total_head < 0) or (total_head > total_rear):
        return []

    # split by parallel_n
    raw_parallel_backlog_index_list = split_by_segment_n(total_rear-total_head, processes_n)

    # split into batches
    parallel_backlog_index_list = []
    for (head, rear) in raw_parallel_backlog_index_list:

        head = min(total_rear, head+offset)
        rear = min(total_rear, rear+offset)

        backlog_index_list = split_by_segment_size(
            rear - head,
            min(batch_size, rear - head),
            head
        )
        parallel_backlog_index_list.append(backlog_index_list)

    return parallel_backlog_index_list
